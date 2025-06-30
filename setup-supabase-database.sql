-- Audio Enhancer Pro - Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  amount decimal(10,2),
  currency text DEFAULT 'usd',
  trial_end timestamp with time zone,
  plan_name text DEFAULT 'pro',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions" 
ON subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own subscriptions  
CREATE POLICY "Users can update own subscriptions" 
ON subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user settings table (for extension preferences)
CREATE TABLE user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can manage own settings" 
ON user_settings FOR ALL 
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON user_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION is_pro_user(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = user_uuid 
    AND status = 'active' 
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid uuid)
RETURNS TABLE (
  is_pro boolean,
  status text,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  plan_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    is_pro_user(user_uuid) as is_pro,
    s.status,
    s.current_period_end,
    s.trial_end,
    s.plan_name
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription found, return default values
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'none'::text, null::timestamp with time zone, null::timestamp with time zone, 'free'::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some example data (optional - remove if not needed)
-- This creates a test user subscription - remove this in production
-- INSERT INTO subscriptions (user_id, status, amount, plan_name, current_period_end) 
-- VALUES (
--   auth.uid(), 
--   'active', 
--   9.99, 
--   'pro',
--   now() + interval '1 month'
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT EXECUTE ON FUNCTION is_pro_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Audio Enhancer Pro database setup completed successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your Chrome extension with Supabase integration';
  RAISE NOTICE '2. Set up Stripe webhooks to sync subscription status';
  RAISE NOTICE '3. Test the authentication flow';
END $$; 