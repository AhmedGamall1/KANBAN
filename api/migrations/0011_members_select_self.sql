CREATE POLICY members_select_self ON workspace_members
  FOR SELECT USING (user_id = app_current_user_id());