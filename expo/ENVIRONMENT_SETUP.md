# 🔐 SnapCarb Authentication Environment Setup

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# Gemini AI Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Resend Email Configuration
EXPO_PUBLIC_RESEND_API_KEY=your_resend_api_key_here

# App Configuration
EXPO_PUBLIC_APP_NAME=SnapCarb
EXPO_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
DEBUG=snapcarb:*
LOG_LEVEL=info
```

## 🔑 How to Get These Values

### 1. Supabase Configuration
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `snapcarb://auth/callback` (for mobile)
7. Copy the Client ID

### 3. Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up and create an account
3. Go to API Keys
4. Create a new API key
5. Copy the API key

### 4. Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

## 🚀 Setup Steps

### Step 1: Create Environment File
```bash
# In your project root
cp .env.example .env
# Then edit .env with your actual values
```

### Step 2: Update Supabase Schema
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase/users-schema.sql`

### Step 3: Configure Google OAuth in Supabase
1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth Client ID and Secret
4. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`

### Step 4: Test Authentication
1. Start your app: `npm start`
2. Navigate to the login screen
3. Try signing in with Google
4. Check that welcome email is sent

## 🔒 Security Notes

- **Never commit `.env` files** to version control
- **Use environment variables** for all sensitive data
- **Rotate API keys** regularly
- **Monitor API usage** to prevent abuse

## 🐛 Troubleshooting

### Common Issues

1. **"Google OAuth client ID not configured"**
   - Check that `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env`

2. **"Supabase URL not configured"**
   - Verify `EXPO_PUBLIC_SUPABASE_URL` in `.env`

3. **"Resend API key not configured"**
   - Check `EXPO_PUBLIC_RESEND_API_KEY` in `.env`

4. **Authentication redirect errors**
   - Verify redirect URIs in Google OAuth and Supabase
   - Check that scheme `snapcarb://` is properly configured

5. **Welcome email not sending**
   - Verify Resend API key is correct
   - Check Resend dashboard for any errors
   - Ensure email domain is verified in Resend

## 📱 Mobile Configuration

### Expo Configuration
Make sure your `app.json` includes:

```json
{
  "expo": {
    "scheme": "snapcarb",
    "ios": {
      "bundleIdentifier": "app.snapcarb.health"
    },
    "android": {
      "package": "app.snapcarb.health"
    }
  }
}
```

### Deep Linking
The app uses the `snapcarb://` scheme for OAuth callbacks and deep linking.

## 🎯 Next Steps

After setting up authentication:

1. **Test user registration** and login flow
2. **Verify welcome emails** are being sent
3. **Test user profile** creation and updates
4. **Implement protected routes** based on authentication state
5. **Add user-specific data** to existing features

---

**Need help?** Check the Supabase and Resend documentation, or review the authentication service code for debugging.
