-- Add columns to templates table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'assigned_approver_id') THEN
        ALTER TABLE templates ADD COLUMN assigned_approver_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'last_reminder_sent') THEN
        ALTER TABLE templates ADD COLUMN last_reminder_sent TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'approval_requested_at') THEN
        ALTER TABLE templates ADD COLUMN approval_requested_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'approved_at') THEN
        ALTER TABLE templates ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Add columns to contracts table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'assigned_approver_id') THEN
        ALTER TABLE contracts ADD COLUMN assigned_approver_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'last_reminder_sent') THEN
        ALTER TABLE contracts ADD COLUMN last_reminder_sent TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'approval_requested_at') THEN
        ALTER TABLE contracts ADD COLUMN approval_requested_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'approved_at') THEN
        ALTER TABLE contracts ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END
$$;

-- Create user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    activity_type TEXT NOT NULL,
    description TEXT,
    related_item_id TEXT,
    related_item_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);

-- Create index on activity_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Add RLS policies for user_activities table
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Policy for inserting activities (allow authenticated users)
DROP POLICY IF EXISTS insert_user_activities ON user_activities;
CREATE POLICY insert_user_activities ON user_activities 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Policy for selecting own activities (users can see their own activities)
DROP POLICY IF EXISTS select_own_user_activities ON user_activities;
CREATE POLICY select_own_user_activities ON user_activities 
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy for admins to see all activities
DROP POLICY IF EXISTS admin_select_all_user_activities ON user_activities;
CREATE POLICY admin_select_all_user_activities ON user_activities 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
