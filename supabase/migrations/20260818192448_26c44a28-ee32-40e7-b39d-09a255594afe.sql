REVOKE ALL ON FUNCTION public.auto_assign_sequence_to_new_lead() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_invoice_paid() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_duplicate_lead() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.is_task_collaborator(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_task_collaborator(uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.is_task_creator(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_task_creator(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.increment_content_view(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_content_view(text, text) TO anon, authenticated, service_role;