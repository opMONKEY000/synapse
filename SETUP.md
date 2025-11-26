# 🚀 Synapse Setup Guide

## Stack Overview

Your Synapse project is now configured with:

- ✅ **Next.js 16** - React framework with App Router
- ✅ **TypeScript** - Type safety
- ✅ **NextAuth v5** - Authentication (Google, GitHub, Email)
- ✅ **Prisma** - Database ORM
- ✅ **PostgreSQL** - Database (via Supabase)
- ✅ **Supabase** - File storage for PDFs
- ✅ **Vercel AI SDK** - AI integration
- ✅ **OpenAI** - AI teaching assistant
- ✅ **Tailwind CSS** - Utility-first CSS
- ✅ **pnpm** - Package manager

---

## 📋 Next Steps

### 1. Set Up Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your project URL and keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (from Settings → API)
4. Get your database connection string:
   - Go to Settings → Database
   - Copy the connection string (Pooling mode)
   - Use it for `DATABASE_URL`

### 2. Configure Environment Variables

Copy `env.example.txt` to `.env` and fill in the values:

```bash
# Required
DATABASE_URL="your-supabase-postgres-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Required for AI
OPENAI_API_KEY="your-openai-api-key"

# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Optional - Choose at least one auth provider
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
RESEND_API_KEY=""
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env` file.

### 4. Run Database Migrations

Once your `.env` is configured, run:

```bash
pnpm prisma generate
pnpm prisma db push
```

This will:
- Generate the Prisma client
- Create all database tables in Supabase

### 5. Set Up OAuth Providers (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

### 6. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Go to API Keys
4. Create a new secret key
5. Copy it to `OPENAI_API_KEY` in `.env`

### 7. Set Up Supabase Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `documents`
3. Set it to **private** (we'll handle auth)
4. Create policies for authenticated users to upload/read

---

## 🎯 Database Schema

Your database includes:

### Authentication
- `users` - User accounts
- `accounts` - OAuth provider accounts
- `sessions` - User sessions
- `verification_tokens` - Email verification

### Learning Content
- `documents` - Uploaded PDFs and notes
- `timelines` - Generated learning timelines
- `events` - Timeline events (e.g., historical moments)

### AI Teaching
- `conversations` - AI chat sessions
- `messages` - Individual messages

### Recall System
- `recall_sessions` - Review sessions
- `review_items` - Spaced repetition items

---

## 🏃 Running the App

Once everything is configured:

```bash
pnpm dev
```

Visit `http://localhost:3000`

---

## 📦 Installed Packages

### Core
- `next` - Next.js framework
- `react` - React library
- `typescript` - TypeScript

### Auth
- `next-auth@beta` - Authentication
- `@auth/prisma-adapter` - Prisma adapter for NextAuth

### Database
- `@prisma/client` - Prisma client
- `prisma` - Prisma CLI

### Storage
- `@supabase/supabase-js` - Supabase client

### AI
- `ai` - Vercel AI SDK
- `openai` - OpenAI SDK
- `zod` - Schema validation

### Styling
- `tailwindcss` - Utility CSS
- `postcss` - CSS processing

---

## 🎨 Next: Building the UI

Once your backend is set up, we'll build:

1. **Landing Page** - Animated chalkboard with "Step Up to the Board"
2. **Upload Interface** - PDF upload with drag & drop
3. **Timeline Visualization** - Animated chalk timeline
4. **AI Teaching Interface** - Interactive conversation
5. **Recall Mode** - Fill-in-the-blanks with erasing effect
6. **Review Dashboard** - Progress tracking

---

## 🆘 Troubleshooting

### Prisma errors
- Make sure `DATABASE_URL` is correct
- Run `pnpm prisma generate` after schema changes

### Auth not working
- Check `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is set
- Check OAuth redirect URIs match exactly

### Supabase connection issues
- Verify all three Supabase env vars are set
- Check if your IP is allowed in Supabase settings

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://authjs.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

Ready to start building the chalkboard UI? 🎓✨
