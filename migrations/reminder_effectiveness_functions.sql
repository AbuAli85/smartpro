-- Function to calculate approval response times
CREATE OR REPLACE FUNCTION get_approval_response_times(time_range TEXT)
RETURNS TABLE (
  item_type TEXT,
  item_id TEXT,
  item_name TEXT,
  approver_name TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  response_time_hours NUMERIC,
  response_after_reminder BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set the appropriate date range based on the time_range parameter
  IF time_range = 'week' THEN
    start_date := CURRENT_DATE - INTERVAL '7 days';
  ELSIF time_range = 'month' THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  ELSIF time_range = 'quarter' THEN
    start_date := CURRENT_DATE - INTERVAL '90 days';
  ELSIF time_range = 'year' THEN
    start_date := CURRENT_DATE - INTERVAL '365 days';
  ELSE
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;

  RETURN QUERY
  -- Get template approval response times
  SELECT 
    'template'::TEXT as item_type,
    t.id::TEXT as item_id,
    t.name as item_name,
    COALESCE(up.full_name, 'Unknown') as approver_name,
    t.approval_requested_at as requested_at,
    t.approved_at,
    t.last_reminder_sent as reminder_sent_at,
    ROUND(EXTRACT(EPOCH FROM (t.approved_at - t.approval_requested_at)) / 3600, 1) as response_time_hours,
    CASE 
      WHEN t.last_reminder_sent IS NOT NULL AND t.approved_at > t.last_reminder_sent THEN TRUE
      ELSE FALSE
    END as response_after_reminder
  FROM templates t
  LEFT JOIN user_profiles up ON t.assigned_approver_id = up.user_id
  WHERE t.approval_status = 'approved'
    AND t.approval_requested_at IS NOT NULL
    AND t.approved_at IS NOT NULL
    AND t.approved_at >= start_date
  
  UNION ALL
  
  -- Get contract approval response times
  SELECT 
    'contract'::TEXT as item_type,
    c.id::TEXT as item_id,
    CONCAT(c.first_party_name, ' & ', c.second_party_name) as item_name,
    COALESCE(up.full_name, 'Unknown') as approver_name,
    c.approval_requested_at as requested_at,
    c.approved_at,
    c.last_reminder_sent as reminder_sent_at,
    ROUND(EXTRACT(EPOCH FROM (c.approved_at - c.approval_requested_at)) / 3600, 1) as response_time_hours,
    CASE 
      WHEN c.last_reminder_sent IS NOT NULL AND c.approved_at > c.last_reminder_sent THEN TRUE
      ELSE FALSE
    END as response_after_reminder
  FROM contracts c
  LEFT JOIN user_profiles up ON c.assigned_approver_id = up.user_id
  WHERE c.status = 'approved'
    AND c.approval_requested_at IS NOT NULL
    AND c.approved_at IS NOT NULL
    AND c.approved_at >= start_date
  
  ORDER BY requested_at DESC;
END;
$$;

-- Function to get reminder effectiveness metrics
CREATE OR REPLACE FUNCTION get_reminder_effectiveness(time_range TEXT)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
  total_approvals BIGINT;
  approvals_with_reminders BIGINT;
  approvals_after_reminders BIGINT;
  avg_response_time_with_reminder NUMERIC;
  avg_response_time_without_reminder NUMERIC;
BEGIN
  -- Set the appropriate date range based on the time_range parameter
  IF time_range = 'week' THEN
    start_date := CURRENT_DATE - INTERVAL '7 days';
  ELSIF time_range = 'month' THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  ELSIF time_range = 'quarter' THEN
    start_date := CURRENT_DATE - INTERVAL '90 days';
  ELSIF time_range = 'year' THEN
    start_date := CURRENT_DATE - INTERVAL '365 days';
  ELSE
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;

  -- Calculate metrics for templates
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE t.last_reminder_sent IS NOT NULL),
    COUNT(*) FILTER (WHERE t.last_reminder_sent IS NOT NULL AND t.approved_at > t.last_reminder_sent),
    AVG(EXTRACT(EPOCH FROM (t.approved_at - t.approval_requested_at)) / 3600) FILTER (WHERE t.last_reminder_sent IS NOT NULL),
    AVG(EXTRACT(EPOCH FROM (t.approved_at - t.approval_requested_at)) / 3600) FILTER (WHERE t.last_reminder_sent IS NULL)
  INTO
    total_approvals,
    approvals_with_reminders,
    approvals_after_reminders,
    avg_response_time_with_reminder,
    avg_response_time_without_reminder
  FROM templates t
  WHERE t.approval_status = 'approved'
    AND t.approval_requested_at IS NOT NULL
    AND t.approved_at IS NOT NULL
    AND t.approved_at >= start_date;

  -- Add contract metrics
  SELECT 
    total_approvals + COUNT(*),
    approvals_with_reminders + COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL),
    approvals_after_reminders + COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL AND c.approved_at > c.last_reminder_sent),
    (COALESCE(avg_response_time_with_reminder, 0) + COALESCE(AVG(EXTRACT(EPOCH FROM (c.approved_at - c.approval_requested_at)) / 3600) FILTER (WHERE c.last_reminder_sent IS NOT NULL), 0)) / 
      CASE WHEN avg_response_time_with_reminder IS NULL AND COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL) = 0 THEN 1 ELSE 2 END,
    (COALESCE(avg_response_time_without_reminder, 0) + COALESCE(AVG(EXTRACT(EPOCH FROM (c.approved_at - c.approval_requested_at)) / 3600) FILTER (WHERE c.last_reminder_sent IS NULL), 0)) / 
      CASE WHEN avg_response_time_without_reminder IS NULL AND COUNT(*) FILTER (WHERE c.last_reminder_sent IS NULL) = 0 THEN 1 ELSE 2 END
  INTO
    total_approvals,
    approvals_with_reminders,
    approvals_after_reminders,
    avg_response_time_with_reminder,
    avg_response_time_without_reminder
  FROM contracts c
  WHERE c.status = 'approved'
    AND c.approval_requested_at IS NOT NULL
    AND c.approved_at IS NOT NULL
    AND c.approved_at >= start_date;

  -- Return metrics as rows
  RETURN QUERY
  SELECT 'total_approvals'::TEXT, total_approvals::NUMERIC
  UNION ALL
  SELECT 'approvals_with_reminders'::TEXT, approvals_with_reminders::NUMERIC
  UNION ALL
  SELECT 'approvals_after_reminders'::TEXT, approvals_after_reminders::NUMERIC
  UNION ALL
  SELECT 'reminder_effectiveness_rate'::TEXT, 
    CASE WHEN approvals_with_reminders = 0 THEN 0 
         ELSE ROUND((approvals_after_reminders::NUMERIC / approvals_with_reminders::NUMERIC) * 100, 1) 
    END
  UNION ALL
  SELECT 'avg_response_time_with_reminder_hours'::TEXT, ROUND(COALESCE(avg_response_time_with_reminder, 0), 1)
  UNION ALL
  SELECT 'avg_response_time_without_reminder_hours'::TEXT, ROUND(COALESCE(avg_response_time_without_reminder, 0), 1)
  UNION ALL
  SELECT 'response_time_improvement_percent'::TEXT, 
    CASE WHEN COALESCE(avg_response_time_without_reminder, 0) = 0 THEN 0
         ELSE ROUND(((COALESCE(avg_response_time_without_reminder, 0) - COALESCE(avg_response_time_with_reminder, 0)) / 
                     COALESCE(avg_response_time_without_reminder, 1)) * 100, 1)
    END;
END;
$$;

-- Function to get approver performance metrics
CREATE OR REPLACE FUNCTION get_approver_performance(time_range TEXT)
RETURNS TABLE (
  approver_id TEXT,
  approver_name TEXT,
  approver_email TEXT,
  total_assigned BIGINT,
  total_completed BIGINT,
  completion_rate NUMERIC,
  avg_response_time_hours NUMERIC,
  response_after_reminder_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set the appropriate date range based on the time_range parameter
  IF time_range = 'week' THEN
    start_date := CURRENT_DATE - INTERVAL '7 days';
  ELSIF time_range = 'month' THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  ELSIF time_range = 'quarter' THEN
    start_date := CURRENT_DATE - INTERVAL '90 days';
  ELSIF time_range = 'year' THEN
    start_date := CURRENT_DATE - INTERVAL '365 days';
  ELSE
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;

  RETURN QUERY
  WITH approver_metrics AS (
    -- Template metrics by approver
    SELECT 
      up.user_id as approver_id,
      up.full_name as approver_name,
      au.email as approver_email,
      COUNT(*) as assigned_count,
      COUNT(*) FILTER (WHERE t.approval_status = 'approved' OR t.approval_status = 'rejected') as completed_count,
      ROUND(AVG(EXTRACT(EPOCH FROM (t.approved_at - t.approval_requested_at)) / 3600) 
        FILTER (WHERE t.approval_status = 'approved'), 1) as avg_response_time,
      COUNT(*) FILTER (WHERE t.last_reminder_sent IS NOT NULL AND t.approved_at > t.last_reminder_sent) as after_reminder_count
    FROM templates t
    JOIN user_profiles up ON t.assigned_approver_id = up.user_id
    JOIN auth.users au ON up.user_id = au.id
    WHERE t.approval_requested_at >= start_date
    GROUP BY up.user_id, up.full_name, au.email
    
    UNION ALL
    
    -- Contract metrics by approver
    SELECT 
      up.user_id as approver_id,
      up.full_name as approver_name,
      au.email as approver_email,
      COUNT(*) as assigned_count,
      COUNT(*) FILTER (WHERE c.status = 'approved' OR c.status = 'rejected') as completed_count,
      ROUND(AVG(EXTRACT(EPOCH FROM (c.approved_at - c.approval_requested_at)) / 3600) 
        FILTER (WHERE c.status = 'approved'), 1) as avg_response_time,
      COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL AND c.approved_at > c.last_reminder_sent) as after_reminder_count
    FROM contracts c
    JOIN user_profiles up ON c.assigned_approver_id = up.user_id
    JOIN auth.users au ON up.user_id = au.id
    WHERE c.approval_requested_at >= start_date
    GROUP BY up.user_id, up.full_name, au.email
  )
  
  SELECT 
    approver_id,
    approver_name,
    approver_email,
    SUM(assigned_count)::BIGINT as total_assigned,
    SUM(completed_count)::BIGINT as total_completed,
    ROUND((SUM(completed_count)::NUMERIC / NULLIF(SUM(assigned_count), 0)) * 100, 1) as completion_rate,
    ROUND(AVG(avg_response_time), 1) as avg_response_time_hours,
    ROUND((SUM(after_reminder_count)::NUMERIC / NULLIF(SUM(completed_count), 0)) * 100, 1) as response_after_reminder_rate
  FROM approver_metrics
  GROUP BY approver_id, approver_name, approver_email
  ORDER BY total_assigned DESC;
END;
$$;

-- Function to get reminder effectiveness over time
CREATE OR REPLACE FUNCTION get_reminder_effectiveness_over_time(time_range TEXT)
RETURNS TABLE (
  period TEXT,
  total_approvals BIGINT,
  approvals_with_reminders BIGINT,
  approvals_after_reminders BIGINT,
  effectiveness_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
  interval_type TEXT;
  date_trunc_val TEXT;
BEGIN
  -- Set the appropriate date range and grouping based on the time_range parameter
  IF time_range = 'week' THEN
    start_date := CURRENT_DATE - INTERVAL '7 days';
    interval_type := '1 day';
    date_trunc_val := 'day';
  ELSIF time_range = 'month' THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
    interval_type := '1 week';
    date_trunc_val := 'week';
  ELSIF time_range = 'quarter' THEN
    start_date := CURRENT_DATE - INTERVAL '90 days';
    interval_type := '1 month';
    date_trunc_val := 'month';
  ELSIF time_range = 'year' THEN
    start_date := CURRENT_DATE - INTERVAL '365 days';
    interval_type := '1 month';
    date_trunc_val := 'month';
  ELSE
    start_date := CURRENT_DATE - INTERVAL '30 days';
    interval_type := '1 week';
    date_trunc_val := 'week';
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      date_trunc(date_trunc_val, start_date),
      date_trunc(date_trunc_val, CURRENT_DATE),
      interval_type::interval
    ) AS period_start
  ),
  template_metrics AS (
    SELECT 
      date_trunc(date_trunc_val, t.approved_at) as period_start,
      COUNT(*) as approval_count,
      COUNT(*) FILTER (WHERE t.last_reminder_sent IS NOT NULL) as with_reminder_count,
      COUNT(*) FILTER (WHERE t.last_reminder_sent IS NOT NULL AND t.approved_at > t.last_reminder_sent) as after_reminder_count
    FROM templates t
    WHERE t.approval_status = 'approved'
      AND t.approval_requested_at IS NOT NULL
      AND t.approved_at IS NOT NULL
      AND t.approved_at >= start_date
    GROUP BY period_start
  ),
  contract_metrics AS (
    SELECT 
      date_trunc(date_trunc_val, c.approved_at) as period_start,
      COUNT(*) as approval_count,
      COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL) as with_reminder_count,
      COUNT(*) FILTER (WHERE c.last_reminder_sent IS NOT NULL AND c.approved_at > c.last_reminder_sent) as after_reminder_count
    FROM contracts c
    WHERE c.status = 'approved'
      AND c.approval_requested_at IS NOT NULL
      AND c.approved_at IS NOT NULL
      AND c.approved_at >= start_date
    GROUP BY period_start
  ),
  combined_metrics AS (
    SELECT 
      period_start,
      SUM(approval_count) as total_approvals,
      SUM(with_reminder_count) as approvals_with_reminders,
      SUM(after_reminder_count) as approvals_after_reminders
    FROM (
      SELECT * FROM template_metrics
      UNION ALL
      SELECT * FROM contract_metrics
    ) all_metrics
    GROUP BY period_start
  )
  
  SELECT 
    CASE 
      WHEN date_trunc_val = 'day' THEN to_char(ds.period_start, 'Mon DD')
      WHEN date_trunc_val = 'week' THEN to_char(ds.period_start, 'Mon DD') || ' - ' || to_char(ds.period_start + INTERVAL '6 days', 'Mon DD')
      WHEN date_trunc_val = 'month' THEN to_char(ds.period_start, 'Mon YYYY')
      ELSE to_char(ds.period_start, 'Mon DD')
    END as period,
    COALESCE(cm.total_approvals, 0) as total_approvals,
    COALESCE(cm.approvals_with_reminders, 0) as approvals_with_reminders,
    COALESCE(cm.approvals_after_reminders, 0) as approvals_after_reminders,
    CASE 
      WHEN COALESCE(cm.approvals_with_reminders, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(cm.approvals_after_reminders, 0)::NUMERIC / COALESCE(cm.approvals_with_reminders, 1)) * 100, 1)
    END as effectiveness_rate
  FROM date_series ds
  LEFT JOIN combined_metrics cm ON ds.period_start = cm.period_start
  ORDER BY ds.period_start;
END;
$$;
