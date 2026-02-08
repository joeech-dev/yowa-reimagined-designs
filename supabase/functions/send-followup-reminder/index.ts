import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEME_IO_API_KEY = Deno.env.get("SYSTEME_IO_API_KEY");
const SYSTEME_IO_API_URL = "https://api.systeme.io/api";

async function applyTagToContact(email: string, tagName: string) {
  if (!SYSTEME_IO_API_KEY) {
    console.error("SYSTEME_IO_API_KEY not configured");
    return false;
  }

  try {
    // Find contact by email
    const searchRes = await fetch(`${SYSTEME_IO_API_URL}/contacts?email=${encodeURIComponent(email)}`, {
      headers: { "X-API-Key": SYSTEME_IO_API_KEY },
    });

    if (!searchRes.ok) { console.error("Failed to search contact"); return false; }
    const searchData = await searchRes.json();
    const contact = searchData.items?.[0];
    if (!contact) { console.log(`Contact not found in systeme.io: ${email}`); return false; }

    // Create or find tag
    let tagId: string | null = null;
    const createTagRes = await fetch(`${SYSTEME_IO_API_URL}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": SYSTEME_IO_API_KEY },
      body: JSON.stringify({ name: tagName }),
    });

    if (createTagRes.ok) {
      const tagData = await createTagRes.json();
      tagId = tagData.id;
    } else {
      // Tag exists, find it
      const tagsRes = await fetch(`${SYSTEME_IO_API_URL}/tags`, { headers: { "X-API-Key": SYSTEME_IO_API_KEY } });
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const existing = tagsData.items?.find((t: any) => t.name === tagName);
        tagId = existing?.id || null;
      }
    }

    if (!tagId) { console.error(`Could not find/create tag: ${tagName}`); return false; }

    // Assign tag to contact
    const assignRes = await fetch(`${SYSTEME_IO_API_URL}/tags/${tagId}/contacts/${contact.id}`, {
      method: "PUT",
      headers: { "X-API-Key": SYSTEME_IO_API_KEY },
    });

    console.log(`Tag "${tagName}" ${assignRes.ok ? 'applied' : 'failed'} for ${email}`);
    return assignRes.ok;
  } catch (error) {
    console.error(`Error applying tag ${tagName} to ${email}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    let processedCount = 0;

    // Process sequence-based follow-ups
    const { data: dueAssignments, error: assignError } = await supabaseClient
      .from('lead_sequence_assignments')
      .select('*')
      .eq('status', 'active')
      .lte('next_step_due_at', now.toISOString());

    if (assignError) {
      console.error('Error fetching assignments:', assignError);
    }

    for (const assignment of dueAssignments || []) {
      try {
        const nextStepOrder = assignment.current_step_order + 1;

        // Get the next step
        const { data: step } = await supabaseClient
          .from('sequence_steps')
          .select('*')
          .eq('sequence_id', assignment.sequence_id)
          .eq('step_order', nextStepOrder)
          .single();

        if (!step) {
          // No more steps — mark completed
          await supabaseClient
            .from('lead_sequence_assignments')
            .update({ status: 'completed', completed_at: now.toISOString() })
            .eq('id', assignment.id);
          console.log(`Sequence completed for assignment ${assignment.id}`);
          continue;
        }

        // Get lead email
        const { data: lead } = await supabaseClient
          .from('leads')
          .select('email, name')
          .eq('id', assignment.lead_id)
          .single();

        if (!lead) { console.error(`Lead not found: ${assignment.lead_id}`); continue; }

        // Apply tag in systeme.io
        await applyTagToContact(lead.email, step.tag_name);

        // Log outreach
        await supabaseClient.from('outreach_log').insert({
          lead_id: assignment.lead_id,
          channel: 'email',
          message_content: `Sequence step ${nextStepOrder}: Applied tag "${step.tag_name}"${step.email_subject ? ` — ${step.email_subject}` : ''}`,
          status: 'sent',
        });

        // Check if there's a next step after this one
        const { data: nextNextStep } = await supabaseClient
          .from('sequence_steps')
          .select('delay_days')
          .eq('sequence_id', assignment.sequence_id)
          .eq('step_order', nextStepOrder + 1)
          .maybeSingle();

        const nextDue = nextNextStep
          ? new Date(now.getTime() + nextNextStep.delay_days * 86400000).toISOString()
          : null;

        await supabaseClient
          .from('lead_sequence_assignments')
          .update({
            current_step_order: nextStepOrder,
            last_step_executed_at: now.toISOString(),
            next_step_due_at: nextDue,
            ...(nextDue ? {} : { status: 'completed', completed_at: now.toISOString() }),
          })
          .eq('id', assignment.id);

        processedCount++;
        console.log(`Processed step ${nextStepOrder} for lead ${lead.name}`);
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
      }
    }

    // Also process legacy follow-up reminders (leads without sequences)
    const today = now.toISOString().split('T')[0];
    const { data: legacyLeads } = await supabaseClient
      .from('leads')
      .select('*')
      .lte('next_followup_date', `${today}T23:59:59`)
      .in('status', ['new', 'contacted']);

    for (const lead of legacyLeads || []) {
      // Skip if lead is already in an active sequence
      const { data: activeAssignment } = await supabaseClient
        .from('lead_sequence_assignments')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeAssignment) continue;

      await supabaseClient.from('outreach_log').insert({
        lead_id: lead.id,
        channel: 'email',
        message_content: `Follow-up reminder for ${lead.name}`,
        status: 'pending',
      });

      const nextFollowup = new Date(now.getTime() + 7 * 86400000);
      await supabaseClient.from('leads').update({
        next_followup_date: nextFollowup.toISOString(),
        last_contact_date: now.toISOString(),
      }).eq('id', lead.id);

      processedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, processed: processedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-followup-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
