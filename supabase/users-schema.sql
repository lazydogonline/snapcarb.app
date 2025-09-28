-- Users table for SnapCarb authentication and user profiles
-- This table stores user information, preferences, and authentication data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{
    "notifications_enabled": true,
    "theme": "auto",
    "health_goals": []
  }'::jsonb,
  health_profile JSONB DEFAULT '{
    "age": null,
    "gender": null,
    "weight": null,
    "height": null,
    "activity_level": null,
    "health_conditions": [],
    "medications": [],
    "allergies": []
  }'::jsonb,
  subscription_status TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  total_referrals INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  points_spent INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth.users record is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update last sign in
CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_sign_in = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last sign in when user signs in
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in IS DISTINCT FROM NEW.last_sign_in)
  EXECUTE FUNCTION update_last_sign_in();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create user with referral code
CREATE OR REPLACE FUNCTION create_user_with_referral(
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  referrer_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  referrer_id UUID;
BEGIN
  -- Generate referral code for new user
  PERFORM generate_referral_code();
  
  -- If referrer code provided, get referrer ID
  IF referrer_code IS NOT NULL THEN
    SELECT id INTO referrer_id FROM users WHERE referral_code = referrer_code;
  END IF;
  
  -- Create user profile
  INSERT INTO users (email, full_name, referral_code, referred_by)
  VALUES (user_email, user_full_name, generate_referral_code(), referrer_id)
  RETURNING id INTO user_id;
  
  -- Update referrer's total referrals if applicable
  IF referrer_id IS NOT NULL THEN
    UPDATE users 
    SET total_referrals = total_referrals + 1,
        points_earned = points_earned + 100
    WHERE id = referrer_id;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  total_meals INTEGER,
  total_recipes INTEGER,
  total_fasting_hours INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT m.id), 0)::INTEGER as total_meals,
    COALESCE(COUNT(DISTINCT r.id), 0)::INTEGER as total_recipes,
    COALESCE(SUM(f.duration_hours), 0)::INTEGER as total_fasting_hours,
    0::INTEGER as current_streak, -- TODO: Implement streak calculation
    0::INTEGER as longest_streak   -- TODO: Implement streak calculation
  FROM users u
  LEFT JOIN meals m ON u.id = m.user_id
  LEFT JOIN recipes r ON u.id = r.user_id
  LEFT JOIN fasting_sessions f ON u.id = f.user_id
  WHERE u.id = user_uuid
  GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO users (id, email, full_name, referral_code) VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'test@snapcarb.com', 'Test User', 'TEST1234');

-- Comments for documentation
COMMENT ON TABLE users IS 'User profiles and preferences for SnapCarb app';
COMMENT ON COLUMN users.preferences IS 'User preferences including notifications, theme, and health goals';
COMMENT ON COLUMN users.health_profile IS 'Basic health information for personalized recommendations';
COMMENT ON COLUMN users.referral_code IS 'Unique referral code for the user';
COMMENT ON COLUMN users.referred_by IS 'ID of user who referred this user';
COMMENT ON COLUMN users.points_earned IS 'Total points earned through app usage and referrals';
COMMENT ON COLUMN users.points_spent IS 'Total points spent on rewards or features';
