
-- Allow all authenticated users to read profiles (needed for messaging user lookup)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);
