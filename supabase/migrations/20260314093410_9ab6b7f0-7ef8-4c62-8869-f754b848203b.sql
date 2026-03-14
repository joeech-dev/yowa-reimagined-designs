
-- Allow users to update their own requisitions only while still pending
CREATE POLICY "Users can update own pending requisitions"
ON public.expense_requisitions
FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id AND status = 'pending')
WITH CHECK (auth.uid() = requester_id AND status = 'pending');
