# Local Setup Guide for Another PC

This guide explains how to run this project locally on another computer step by step, including cloning it from GitHub.

## 1. Requirements

Install these on the other PC:

- Git
- Node.js 18 or higher
- npm
- PostgreSQL (optional if you use a cloud database instead)

You can check if they are installed with:

```bash
git --version
node --version
npm --version
```

## 2. Clone the Project from GitHub

Open a terminal and run:

```bash
git clone <your-github-repo-url>
cd Grocery
```

If the folder name is different, use that folder name instead of `Grocery`.

## 3. Install Dependencies

Inside the project folder, run:

```bash
npm install
```

This will install all required packages.

## 4. Set Up Environment Variables

Create a file named `.env.local` in the project root.

You can copy the example file if it exists:

```bash
copy .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` manually.

Add the following values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/grocery_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

If you are using a cloud PostgreSQL database such as Neon, replace the `DATABASE_URL` with your own connection string.

## 5. Start PostgreSQL

If you are using a local PostgreSQL database, make sure PostgreSQL is running.

You can create a database named `grocery_db` using PostgreSQL tools or a database client.

Example with psql:

```bash
psql -U postgres
CREATE DATABASE grocery_db;
\q
```

If you are using a cloud database, you do not need to install PostgreSQL locally.

## 6. Run Prisma Database Setup

For a fresh local setup, it is safer to use Prisma migrations instead of `db push`. Migrations create a tracked history of schema changes and are the recommended approach for real projects.

In the project folder, run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

This will:
- generate Prisma client
- create and apply the database migration
- seed sample data

If you are only testing quickly on a disposable database, `npx prisma db push` can work, but migrations are more reliable for long-term use.

## 7. Start the Project

Run the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 8. Useful Commands

```bash
npm run dev        # start local development server
npm run build      # build for production
npm start          # start production build
npm run db:migrate  # apply Prisma migrations
npm run db:seed     # seed sample data
```

## 9. Common Issues

### Port already in use
If port 3000 is already busy, stop the other process or use another port:

```bash
npm run dev -- --port 3001
```

### Database connection error
Check that:
- PostgreSQL is running
- the database name is correct
- the username/password in `.env.local` are correct
- the `DATABASE_URL` format is correct

### Prisma errors
Try:

```bash
npx prisma generate
npx prisma db push
```

## 10. Optional: Using Docker

If you want to run the project with Docker instead of local PostgreSQL, you can use:

```bash
docker compose up --build
```

This will start the app and database containers.

## 11. Default Admin Login

After seeding the database, you may be able to log in with the seeded admin account if the app includes one.

Check the project README or seed file for the exact credentials.
