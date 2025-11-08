import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get leads that need follow-up today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: leads, error: leadsError } = await supabaseClient
      .from('leads')
      .select('*')
      .lte('next_followup_date', `${today}T23:59:59`)
      .in('status', ['new', 'contacted']);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      throw leadsError;
    }

    console.log(`Found ${leads?.length || 0} leads requiring follow-up`);

    // Process each lead
    for (const lead of leads || []) {
      try {
        // Log the outreach attempt
        const { error: logError } = await supabaseClient
          .from('outreach_log')
          .insert({
            lead_id: lead.id,
            channel: 'email',
            message_content: `Follow-up reminder for ${lead.name}`,
            status: 'pending'
          });

        if (logError) {
          console.error('Error logging outreach:', logError);
        }

        // Update the lead's next follow-up date (7 days from now)
        const nextFollowup = new Date();
        nextFollowup.setDate(nextFollowup.getDate() + 7);

        const { error: updateError } = await supabaseClient
          .from('leads')
          .update({
            next_followup_date: nextFollowup.toISOString(),
            last_contact_date: new Date().toISOString()
          })
          .eq('id', lead.id);

        if (updateError) {
          console.error('Error updating lead:', updateError);
        }

        console.log(`Processed follow-up for lead: ${lead.name}`);
      } catch (error) {
        console.error(`Error processing lead ${lead.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: leads?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-followup-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
