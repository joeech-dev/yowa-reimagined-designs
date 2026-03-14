import { supabase } from "@/integrations/supabase/client";

type NotifyEvent =
  | "requisition_submitted"
  | "requisition_approved"
  | "requisition_rejected"
  | "task_assigned"
  | "invoice_paid";

type NotifyData = Record<string, string | number | null | undefined>;

/**
 * Fire-and-forget helper — calls the internal-notify edge function.
 * Never throws; logs errors silently so it never blocks UI.
 */
export const sendInternalNotification = async (
  event: NotifyEvent,
  data: NotifyData
): Promise<void> => {
  try {
    await supabase.functions.invoke("internal-notify", {
      body: { event, data },
    });
  } catch (err) {
    console.warn("[internal-notify] failed silently:", err);
  }
};
