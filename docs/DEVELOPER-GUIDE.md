# Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

---

## Project Structure

```
project/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication functions
│   ├── supabase.ts       # Supabase client
│   ├── monitoring.ts    # Monitoring service
│   └── error-tracking.ts # Error tracking
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # E2E tests
└── docs/                # Documentation
```

---

## Authentication Flow

### Sign Up Flow
1. User fills signup form
2. Client-side validation
3. `signUp()` function called
4. Supabase creates user
5. Profile created in `user_profiles` table
6. User redirected to dashboard

### Sign In Flow
1. User fills signin form
2. `signIn()` function called
3. Supabase authenticates user
4. Session established
5. User profile fetched
6. Redirect based on role (admin → admin panel, user → dashboard)

### Password Reset Flow
1. User requests password reset
2. `resetPassword()` sends email with link
3. User clicks link → `/auth/callback?type=recovery&code=...`
4. Callback exchanges code for session
5. Redirects to `/auth/reset-password`
6. User sets new password
7. `updatePassword()` updates password
8. Redirects to signin

---

## Debug Logging

### Debug Log Format
All debug logs use the format:
```
[DEBUG] <file-name> - <step>: <description>
```

### Example Debug Logs
```
[DEBUG] resetPassword - START
[DEBUG] resetPassword - Request details: { email: '...', redirectTo: '...' }
[DEBUG] resetPassword - Calling supabase.auth.resetPasswordForEmail
[DEBUG] resetPassword - Supabase response: { hasData: true, hasError: false }
[DEBUG] resetPassword - SUCCESS: Email sent successfully
```

### Filtering Debug Logs
In browser console, filter by: `[DEBUG]`

---

## Error Handling

### Error Tracking
Errors are tracked using the `errorTracking` service:

```typescript
import { errorTracking } from '@/lib/error-tracking';

try {
  // Your code
} catch (error) {
  errorTracking.captureException(error, {
    userId: user.id,
    action: 'signup',
  });
}
```

### User-Friendly Errors
All errors shown to users are user-friendly. Technical details are only logged in development.

---

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:unit:coverage
```

---

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional
- `NEXT_PUBLIC_SITE_URL` - Site URL (defaults to localhost:3000)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (for error tracking)

---

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  is_admin BOOLEAN DEFAULT false,
  is_developer BOOLEAN DEFAULT false,
  developer_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## RLS Policies

### User Profiles Policies
- `profiles_insert_own` - Users can insert their own profile
- `profiles_select_own` - Users can select their own profile
- `profiles_update_own` - Users can update their own profile
- `profiles_admin_select_all` - Admins can select all profiles
- `profiles_admin_update_all` - Admins can update all profiles

### Helper Function
- `is_admin_user(UUID)` - SECURITY DEFINER function to check admin status without recursion

---

## Performance Optimization

### Code Splitting
- Automatic with Turbopack
- Route-based splitting
- Component lazy loading

### Image Optimization
- Next.js Image component
- WebP/AVIF formats
- Responsive images

### Caching
- Static pages cached
- API routes: no-store
- Images: 1 year cache

---

## Security

### Headers
- CSP (Content Security Policy)
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Authentication
- Secure HTTP-only cookies
- PKCE flow for OAuth
- Password hashing (bcrypt)
- Rate limiting

---

## Monitoring

### Error Tracking
- Console logging (development)
- Ready for Sentry integration
- Unhandled error capture

### Performance Monitoring
- Vercel Analytics
- Vercel Speed Insights
- Web Vitals tracking

---

## Deployment

### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables in Vercel
- Go to Project Settings → Environment Variables
- Add all required variables
- Redeploy after adding variables

---

## Troubleshooting

### Common Issues

#### "Invalid API key"
- Check `.env.local` file
- Verify Supabase anon key
- Restart dev server

#### "RLS infinite recursion"
- Run `FIX-RLS-INFINITE-RECURSION.sql` in Supabase
- Check RLS policies

#### "Password reset link not working"
- Check Supabase redirect URLs
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check email template in Supabase

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Update documentation
5. Submit pull request

---

**Last Updated:** 2025-01-13

