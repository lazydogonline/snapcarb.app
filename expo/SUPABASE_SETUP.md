# 🚀 SnapCarb Supabase Migration Guide

## Why Supabase?

- **No backend management** - Focus on your app, not server maintenance
- **Built-in authentication** - JWT, social login, password reset
- **Real-time database** - Perfect for community features
- **File storage** - Handle meal photos and profile images
- **Edge functions** - For AI meal analysis
- **Automatic scaling** - Handles traffic spikes automatically

## 📋 Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create new project
3. Note your project URL and anon key

### 2. Environment Variables

Create `.env` file in your project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (for AI meal analysis)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install @supabase/supabase-js@^2.39.0
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create all tables and policies

### 5. Storage Buckets

Create these storage buckets in Supabase:

- `meal-photos` (public)
- `profile-photos` (public) 
- `recipe-images` (public)

### 6. Update Frontend Components

Replace API calls with Supabase service calls:

```typescript
// Before (custom backend)
const response = await fetch('/api/meals', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(meal)
});

// After (Supabase)
import { mealService } from '../services/supabase-service';
const meal = await mealService.createMeal(mealData);
```

## 🔄 Migration Benefits

| Feature | Before (Custom Backend) | After (Supabase) |
|---------|------------------------|-------------------|
| **Setup Time** | 2-3 days | 2-3 hours |
| **Authentication** | Custom JWT + bcrypt | Built-in auth |
| **Database** | MongoDB + connection management | PostgreSQL + RLS |
| **File Storage** | Custom multer + file system | Built-in storage |
| **Real-time** | WebSocket setup | Built-in real-time |
| **Scaling** | Manual server management | Automatic |
| **Maintenance** | Server updates, security patches | Handled by Supabase |

## 🎯 Next Steps

1. **Test Authentication** - Sign up/login flow
2. **Test CRUD Operations** - Meals, supplements, etc.
3. **Test File Uploads** - Meal photos
4. **Test Real-time Features** - Community posts
5. **Deploy** - Your app is now production-ready!

## 🚨 Important Notes

- **Row Level Security (RLS)** is enabled by default
- **User data isolation** - Users can only access their own data
- **Public data** - Events and community posts are publicly readable
- **File permissions** - Storage buckets have appropriate access policies

## 🆘 Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [React Native + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

---

**Your SnapCarb app is now much simpler and more scalable! 🎉**



