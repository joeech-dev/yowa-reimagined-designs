
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS show_on_team_board boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS team_board_order integer NOT NULL DEFAULT 0;

-- Allow public (anon) to view profiles marked for team board
CREATE POLICY "Public can view team board members"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (show_on_team_board = true);
