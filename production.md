# Production Guidelines - Voting Formatur PC IPM Wirobrajan

This document outlines the steps and considerations for deploying the application to a production environment.

## 1. Environment Variables
Before deploying, ensure all required environment variables are set in your hosting provider (e.g., Vercel, Netlify).

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for Supabase.
- (Optional) `SUPABASE_SERVICE_ROLE_KEY`: If using server-side admin scripts (keep this secure and NEVER expose it to the browser).

## 2. Supabase Production Setup
### Database Security (RLS)
- Ensure **Row Level Security (RLS)** is enabled on all tables (`candidates`, `voters`, `votes`).
- Create strict RLS policies:
  - `candidates`: Public read access, Admin-only write access.
  - `voters`: Users can only read their own row (based on a token), Admin can read/write all.
  - `votes`: Insert-only for authenticated voters, Read-only for Admins.

### Connection Pooling
If expecting high traffic during the voting period, ensure Supabase Connection Pooling (PgBouncer or Supavisor) is active to handle concurrent connections efficiently.

## 3. Hosting / Deployment
The recommended platform is **Vercel** because it natively supports Next.js.
1. Push the code to a GitHub repository.
2. Import the repository into Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Click Deploy. Vercel will handle the build command (`npm run build`) and start command automatically.

## 4. Performance & Caching
- The candidate list should utilize Next.js data cache (ISR/SSG) if the list rarely changes, or standard fetching with `revalidate`.
- Optimize images using Next.js `<Image />` component to reduce payload size.

## 5. Pre-launch Checklist
- [ ] Test the complete flow (login -> vote -> results update).
- [ ] Ensure one voter token cannot be used twice.
- [ ] Verify that UI works well on mobile screens.
- [ ] Clear any test data from the production database before the actual election begins.
