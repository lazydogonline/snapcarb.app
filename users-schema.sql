-- SnapCarb Users Table Schema
-- This creates the users table and sets up automatic profile creation

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in TIMESTAMPTZ DEFAULT NOW(),
    preferences JSONB DEFAULT '{
        "notifications_enabled": true,
        "theme": "auto",
        "health_goals": []
    }'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS EOF
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url, created_at, last_sign_in)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
EOF LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last_sign_in
CREATE OR REPLACE FUNCTION public.handle_user_signin()
RETURNS TRIGGER AS EOF
BEGIN
    UPDATE public.users 
    SET last_sign_in = NOW(), updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
EOF LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_sign_in
DROP TRIGGER IF EXISTS on_auth_user_signin ON auth.users;
CREATE TRIGGER on_auth_user_signin
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_signin();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_sign_in ON public.users(last_sign_in);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.handle_new_user TO anon, authenticated;
GRANT ALL ON public.handle_user_signin TO anon, authenticated;
