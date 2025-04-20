-- Add assigned_approver_id and last_reminder_sent columns to templates table
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS assigned_approver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Add assigned_approver_id and last_reminder_sent columns to contracts table
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS assigned_approver_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Create user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  related_item_id TEXT,
  related_item_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_assigned_approver_id ON templates(assigned_approver_id);
CREATE INDEX IF NOT EXISTS idx_contracts_assigned_approver_id ON contracts(assigned_approver_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_related_item_id ON user_activities(related_item_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Add RLS policies for user_activities table
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy for inserting activities (allow all authenticated users)
CREATE POLICY insert_user_activities ON user_activities
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy for viewing activities (users can see their own activities, admins can see all)
CREATE POLICY select_user_activities ON user_activities
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );
