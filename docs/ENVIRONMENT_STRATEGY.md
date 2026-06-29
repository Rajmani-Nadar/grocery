# Environment Strategy

## Objective
This document defines a safe and scalable environment strategy for the project so local development, staging, and production can operate independently without conflicting with each other.

## Current Situation
The project currently uses the same Neon database for local development and Vercel production. This is not ideal for a production-grade setup because it mixes development activity with live customer or business data.

## Target Architecture
The recommended architecture is:

- Local Development -> Neon Development Database
- Vercel Production -> Neon Production Database

This separation ensures that:

- local experiments do not affect production data,
- production remains stable during development,
- database migrations can be tested safely,
- and rollback or recovery is easier.

## Why Separate Databases Are Required
Separate databases are required for several reasons:

1. Safety
   - Development work should not risk corrupting production data.
   - Test data should never be mixed with real customer information.

2. Isolation
   - Local changes, schema experiments, and migrations can be tested without impacting live traffic.

3. Reliability
   - Production deployments can be rolled out and validated without interfering with active development work.

4. Compliance and operational control
   - Real application data should be isolated from non-production environments.

5. Better debugging
   - Bugs and data issues can be reproduced in a controlled development database.

## Environment Model
The project should use a clear environment model with at least the following environments:

- Local Development
- Development / Staging
- Production

For this project, the immediate minimum target should be:

- Local development environment using a development database
- Production environment using a production database

## Environment Variable Organization
Environment variables should be grouped by purpose and scope.

### 1. Application Variables
These control core app behavior:

- `NODE_ENV`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

### 2. Database Variables
These should be environment-specific:

- `DATABASE_URL`

Each environment must have its own database connection string.

### 3. Authentication Variables
These configure authentication providers and session behavior:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `JWT_SECRET` if used

### 4. Payment Variables
These must be kept secure and environment-specific:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### 5. Email Variables
These should be configured per environment:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### 6. Media / Storage Variables
These should also be environment-specific:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## .env Files
The project should use environment files that clearly separate local and deployment concerns.

### Recommended files

#### `.env.local`
Used only for local development.

Contains:
- local database URL
- local auth secrets
- local payment test keys
- local email and storage settings

This file should never be committed to Git.

#### `.env.development`
Used for a development or staging environment if one is introduced later.

Contains:
- development database URL
- non-production secrets
- test or sandbox API keys

#### `.env.production`
Used for production deployments.

Contains:
- production database URL
- production secrets
- production payment credentials
- production email and storage variables

#### `.env.example`
A safe template file committed to the repository.

Contains placeholder values for all required variables without exposing secrets.

## Variables That Belong in Vercel
The following should be configured in Vercel project environment variables:

### Production Environment
- `DATABASE_URL` pointing to the Neon production database
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Preview Environment (recommended)
If a preview deployment is used, it should have its own preview environment variables pointing to a separate development or staging database.

## Variables That Belong Locally
The following should remain local to the developer machine:

- local `DATABASE_URL`
- local `NEXTAUTH_SECRET`
- local `NEXTAUTH_URL`
- local test payment keys
- local SMTP test credentials
- local Cloudinary test credentials

Local variables should be stored in `.env.local` and should not be committed to Git.

## Deployment Workflow
A recommended deployment workflow is:

1. Developer makes changes locally.
2. Developer tests the app using the local development database.
3. Changes are committed and pushed to GitHub.
4. GitHub triggers a deployment in Vercel.
5. Vercel uses the production environment variables for the deployment.
6. The deployment connects to the Neon production database.

### Flow
Developer
↓
GitHub
↓
Vercel
↓
Production Database

## Future Deployment Strategy
For future growth, the recommended strategy is:

1. Keep local development isolated from production.
2. Introduce a separate staging or preview environment.
3. Use a dedicated Neon development database for non-production work.
4. Use a dedicated Neon production database for live traffic.
5. Apply Prisma migrations against the correct environment database only.
6. Use Vercel environment variables per environment to avoid accidental cross-environment use.

## Recommended Practices
- Never share production secrets locally.
- Never use the production database URL in local development.
- Use separate Vercel environment scopes for production and preview.
- Keep `.env.local` and other local files out of version control.
- Document every required environment variable in `.env.example`.
- Rotate secrets regularly and avoid hardcoding them into source code.

## Expected Outcome
With this strategy in place:

- local development is safe,
- production remains protected,
- deployments become more predictable,
- and future environment expansion is straightforward.
