# Prisma + Vercel Deployment Guide

## Problem Solved
Fixed the Prisma Client caching issue on Vercel where outdated Prisma Client was causing deployment failures.

## Solution Overview
The fix involves ensuring Prisma Client is regenerated during the Vercel build process via a `postinstall` script.

## Changes Made

### 1. package.json
Added `postinstall` script that automatically runs `prisma generate` after npm install:
```json
"postinstall": "prisma generate"
```

This ensures Prisma Client is regenerated in the Vercel build environment.

### 2. vercel.json
Created configuration file with:
- Build and install commands explicitly defined
- Environment variable prefix for auto-exposure
- PRISMA_SKIP_ENGINE_CHECK placeholder (optional)

## How It Works

### Vercel Deployment Flow:
1. **Install Phase** (`npm install`)
   - Installs all dependencies from package.json
   - Triggers `postinstall` hook automatically
   - **`prisma generate` runs** ← Regenerates Prisma Client

2. **Build Phase** (`next build`)
   - Next.js build process executes
   - Prisma Client is already regenerated and available
   - No stale client issues

3. **Runtime Phase**
   - Application uses fresh Prisma Client
   - Database queries work correctly

## Required Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://yourdomain.com
```

## Local Development

All existing local workflows remain unchanged:

```bash
# Install dependencies (postinstall runs automatically)
npm install

# Generate Prisma Client manually if needed
npx prisma generate

# Development
npm run dev

# Database operations
npm run db:push          # Push schema changes
npm run db:migrate       # Create migrations
npm run db:seed          # Seed data
npm run db:studio        # Open Prisma Studio
```

## Verification Checklist

✅ **Before Deployment:**
- [ ] Run `npm install` locally to verify postinstall works
- [ ] Confirm `prisma` folder exists with `schema.prisma`
- [ ] Ensure `@prisma/client` is in dependencies (✓ v5.8.0)
- [ ] Run `npm run build` successfully locally
- [ ] DATABASE_URL is set in Vercel environment

✅ **After Deployment:**
- [ ] Check Vercel build logs for "prisma generate" in install phase
- [ ] Verify no Prisma Client mismatch errors
- [ ] Test database queries in deployed app
- [ ] Monitor Vercel logs for any Prisma warnings

## Build Log Expected Output

You should see in Vercel build logs:
```
> npm install
> grocery-ecommerce@1.0.0 postinstall
> prisma generate
...
✔ Generated Prisma Client
Packages in scope: prisma
```

## Troubleshooting

### Issue: "Prisma has detected that this project was built on Vercel..."
**Solution:** Verify `postinstall` script is in package.json and pushed to Git

### Issue: Build fails with "Prisma Client not found"
**Solution:** 
- Ensure `.prisma/client` is NOT in `.gitignore`
- Or rely on `postinstall` to regenerate it
- Check DATABASE_URL is set in Vercel environment

### Issue: "Cannot find module '@prisma/client'"
**Solution:** 
- Run `npm install` locally to test
- Ensure `@prisma/client` is in dependencies
- Verify package-lock.json is committed

## Additional Resources

- [Prisma on Vercel](https://www.prisma.io/docs/orm/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js with Prisma](https://nextjs.org/docs/orm-integrations#prisma)

## Current Project Configuration

- **Prisma Version:** 5.8.0
- **Next.js Version:** 15.0.0
- **Database:** PostgreSQL
- **Schema Location:** `/prisma/schema.prisma`
- **Client Generator:** `prisma-client-js`
