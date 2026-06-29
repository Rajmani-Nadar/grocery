# Prisma Migration Recovery Plan

## Current Situation
Prisma is reporting schema drift because the project currently relies on direct schema synchronization through `prisma db push` rather than Prisma Migrate-managed migrations. In this setup:

- the Prisma schema has been applied directly to the Neon database,
- there is no `prisma/migrations` directory,
- and Prisma cannot find a migration history that matches the current database state.

As a result, Prisma sees the database as a state that is not being tracked by migration history, so it reports that the current database is not managed by Prisma Migrate and that migration metadata is missing.

## Root Cause
The root cause is that the project was developed using `prisma db push` instead of creating and applying Prisma migrations.

`prisma db push` updates the database schema directly to match the current Prisma schema. It is useful for rapid development, but it does not create migration files or establish a migration history. Because of that:

- the database schema is changed directly,
- Prisma has no migration ledger to compare against,
- and future Prisma Migrate workflows cannot safely infer the database’s baseline.

This is especially risky when the same database is used across development and production, because the database already contains real application data and is not a disposable staging database.

## Risks
Running `prisma migrate dev` right now is likely to ask for a reset because Prisma sees a mismatch between:

- the Prisma schema definition,
- the existing database structure,
- and the absence of migration history.

The main risks are:

1. Data loss if a reset is performed accidentally.
2. Destructive schema changes if Prisma tries to recreate tables or drop columns.
3. Production instability if the same database is used for both dev and prod environments.
4. Drift between local and remote environments if the database state is not baselined properly.

Because the database contains real data and is shared across environments, a reset is not acceptable.

## Recovery Strategy
The safest recovery approach is to baseline the existing Neon database without deleting any data.

Recommended strategy:

1. Preserve the current production/development database as-is.
2. Create a new migration history from the current schema state.
3. Record the existing database structure as the baseline.
4. Use a non-destructive migration workflow that does not reset tables or drop data.
5. Only after the baseline is created, continue with normal Prisma migration usage.

This should be done carefully in a way that treats the current database as the source of truth and creates a migration history that reflects that state.

## Commands
The following commands will eventually be needed. They are listed here for planning only and were not executed.

### 1. `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script`
- Why it is needed: To compare the current database schema with the Prisma schema definition.
- What it changes: Nothing. It only generates a SQL diff.
- Modifies the database: No.
- Safe: Yes.

### 2. `npx prisma migrate resolve --applied <migration_name>`
- Why it is needed: To mark a migration as applied when the database already contains the equivalent schema state.
- What it changes: Prisma migration tracking metadata only.
- Modifies the database: No, not the schema itself.
- Safe: Yes, if used carefully and only after confirming the database already matches the intended state.

### 3. `npx prisma migrate dev --create-only --name <migration_name> --skip-generate`
- Why it is needed: To create a migration file without applying it immediately.
- What it changes: Creates a migration file in the migrations folder.
- Modifies the database: No.
- Safe: Yes, as long as it is used only to generate the migration artifact.

### 4. `npx prisma migrate dev --name <migration_name> --skip-generate`
- Why it is needed: To apply the created migration locally in a controlled way.
- What it changes: Applies the migration to the configured development database.
- Modifies the database: Yes.
- Safe: Only if the target database is a safe non-production environment or an explicitly approved copy.

### 5. `npx prisma migrate deploy`
- Why it is needed: To apply existing migration files to a production or shared environment.
- What it changes: Applies pending migrations to the target database.
- Modifies the database: Yes.
- Safe: Yes, but only when the migration history is correct and the target database has been validated.

### 6. `npx prisma generate`
- Why it is needed: To regenerate the Prisma client after schema or migration changes.
- What it changes: Updates generated Prisma client code.
- Modifies the database: No.
- Safe: Yes.

### 7. `npx prisma db pull`
- Why it is needed: To introspect the current database schema and update the Prisma schema file.
- What it changes: Updates the Prisma schema based on the live database.
- Modifies the database: No.
- Safe: Yes, but it can overwrite local schema definitions if used carelessly.

### 8. `npx prisma db push`
- Why it is needed: To force the database schema to match the Prisma schema during development.
- What it changes: Syncs the database schema directly.
- Modifies the database: Yes.
- Safe: No, not for this recovery scenario, because it bypasses migration history and can cause drift again.

## Expected Result
After recovery, the project should have:

- a proper `prisma/migrations` folder,
- a baseline migration that reflects the current database state,
- Prisma Migrate tracking enabled for the database,
- no destructive reset requirement during normal migration workflows,
- and a safe migration path for future schema changes.

At that point, the project will be in a stable state where new schema changes can be introduced through Prisma migrations instead of direct schema pushes.

## Important Note
No database changes or Prisma commands should be executed until explicit confirmation is provided.
