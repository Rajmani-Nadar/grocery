Prompt 1
You are a Senior DevOps Engineer and Prisma expert.

IMPORTANT:
Do NOT execute any terminal commands.
Do NOT modify my database.
Do NOT run Prisma commands automatically.

My project currently uses Prisma with a PostgreSQL database hosted on Neon.

Current situation:

- The project was developed using `prisma db push`.
- There is NO `prisma/migrations` folder.
- Prisma reports:
  "No migration found in prisma/migrations."
  "The current database is not managed by Prisma Migrate."
- My development and production environments currently use the SAME Neon database.
- This database contains real application data and MUST NOT be reset.

Your task is ONLY to analyze the project and create documentation.

Create a file:

docs/PRISMA_MIGRATION_RECOVERY_PLAN.md

The document must include:

# Current Situation
Explain why Prisma reports schema drift.

# Root Cause
Explain why using `prisma db push` caused this.

# Risks
Explain why running `prisma migrate dev` currently asks to reset the database.

# Recovery Strategy
Describe the safest way to baseline the existing database WITHOUT deleting any data.

# Commands
List every terminal command that will eventually need to be executed.

DO NOT RUN THEM.

For each command explain:

- why it is needed
- what it changes
- whether it modifies the database
- whether it is safe

# Expected Result

Explain what the project should look like after recovery.

Wait for my confirmation before suggesting or executing any command.




Prompt 2
You are now acting as a DevOps Engineer.

Do NOT execute terminal commands.

Create a file:

docs/ENVIRONMENT_STRATEGY.md

Design a professional environment strategy for this project.

Current situation:

- Local development and Vercel production use the same Neon database.

Target architecture:

Local Development
↓

Neon Development Database

Vercel Production
↓

Neon Production Database

Explain:

- Why separate databases are required.
- How environment variables should be organized.
- Which .env files should exist.
- Which variables belong in Vercel.
- Which variables belong locally.
- How future deployments should work.

Also include:

A deployment workflow from

Developer
↓

GitHub
↓

Vercel
↓

Production Database

Do not execute anything.

Only create documentation.




Prompt 3
You are a Senior Prisma Engineer.

Read:

docs/PRISMA_MIGRATION_RECOVERY_PLAN.md

docs/ENVIRONMENT_STRATEGY.md

Review the current project.

Before writing any code or running any command:

Determine whether it is safer to:

Option A
Create a Prisma migration baseline for the existing production database.

Option B
Clone the production database into a new development database first.

Recommend ONLY ONE option.

Explain why.

List every required step.

Do not execute anything.

Wait for my confirmation.




Prompt 4
Implement ONLY payment verification.

Create:

POST /api/payments/razorpay/verify

Requirements:
- Verify Razorpay signature.
- Update payment status.
- Update order status.
- Handle invalid signatures.
- Prevent duplicate verification.

Do not implement webhook handling.

Stop after completion.





Prompt 5
Implement ONLY Razorpay webhook handling.

Create:

POST /api/payments/razorpay/webhook

Requirements:
- Verify webhook signature.
- Process payment events.
- Prevent duplicate events.
- Update payment and order status.

Do not modify checkout.

Stop after completion.