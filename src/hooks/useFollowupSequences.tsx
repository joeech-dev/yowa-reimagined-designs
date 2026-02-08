import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  tag_name: string;
  email_subject: string | null;
  description: string | null;
  created_at: string;
}

export interface FollowupSequence {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  auto_assign_new_leads: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadSequenceAssignment {
  id: string;
  lead_id: string;
  sequence_id: string;
  current_step_order: number;
  status: string;
  started_at: string;
  last_step_executed_at: string | null;
  next_step_due_at: string | null;
  completed_at: string | null;
}

export const useFollowupSequences = () => {
  const [sequences, setSequences] = useState<FollowupSequence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSequences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("followup_sequences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSequences(data || []);
    } catch (error) {
      console.error("Error fetching sequences:", error);
      toast.error("Failed to load sequences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const createSequence = async (name: string, description: string, autoAssign: boolean) => {
    const { data, error } = await supabase
      .from("followup_sequences")
      .insert({ name, description, auto_assign_new_leads: autoAssign })
      .select()
      .single();
    if (error) throw error;
    await fetchSequences();
    return data;
  };

  const updateSequence = async (id: string, updates: Partial<FollowupSequence>) => {
    const { error } = await supabase
      .from("followup_sequences")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
    await fetchSequences();
  };

  const deleteSequence = async (id: string) => {
    const { error } = await supabase
      .from("followup_sequences")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await fetchSequences();
  };

  return { sequences, loading, fetchSequences, createSequence, updateSequence, deleteSequence };
};

export const useSequenceSteps = (sequenceId: string | null) => {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSteps = useCallback(async () => {
    if (!sequenceId) { setSteps([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sequence_steps")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("step_order", { ascending: true });
      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error("Error fetching steps:", error);
    } finally {
      setLoading(false);
    }
  }, [sequenceId]);

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  const addStep = async (step: { delay_days: number; tag_name: string; email_subject?: string; description?: string }) => {
    if (!sequenceId) return;
    const nextOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) + 1 : 1;
    const { error } = await supabase
      .from("sequence_steps")
      .insert({ ...step, sequence_id: sequenceId, step_order: nextOrder });
    if (error) throw error;
    await fetchSteps();
  };

  const deleteStep = async (stepId: string) => {
    const { error } = await supabase.from("sequence_steps").delete().eq("id", stepId);
    if (error) throw error;
    await fetchSteps();
  };

  return { steps, loading, fetchSteps, addStep, deleteStep };
};

export const useLeadAssignments = (sequenceId: string | null) => {
  const [assignments, setAssignments] = useState<(LeadSequenceAssignment & { lead_name?: string; lead_email?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!sequenceId) { setAssignments([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lead_sequence_assignments")
        .select("*")
        .eq("sequence_id", sequenceId)
        .order("started_at", { ascending: false });
      if (error) throw error;

      // Fetch lead names
      if (data && data.length > 0) {
        const leadIds = data.map(a => a.lead_id);
        const { data: leads } = await supabase
          .from("leads")
          .select("id, name, email")
          .in("id", leadIds);

        const leadsMap = new Map(leads?.map(l => [l.id, l]) || []);
        setAssignments(data.map(a => ({
          ...a,
          lead_name: leadsMap.get(a.lead_id)?.name,
          lead_email: leadsMap.get(a.lead_id)?.email,
        })));
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [sequenceId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const assignLead = async (leadId: string) => {
    if (!sequenceId) return;
    const { error } = await supabase
      .from("lead_sequence_assignments")
      .insert({ lead_id: leadId, sequence_id: sequenceId, next_step_due_at: new Date().toISOString() });
    if (error) throw error;
    await fetchAssignments();
  };

  const removeAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from("lead_sequence_assignments").delete().eq("id", assignmentId);
    if (error) throw error;
    await fetchAssignments();
  };

  return { assignments, loading, fetchAssignments, assignLead, removeAssignment };
};
