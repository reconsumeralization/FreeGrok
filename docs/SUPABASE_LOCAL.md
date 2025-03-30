# Local Supabase Setup

This guide explains how to set up and use the local Supabase instance for development.

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm/pnpm installed

## Starting Local Supabase

We've created a script to easily start your local Supabase instance:

```bash
# Make the script executable (first time only)
chmod +x scripts/start-supabase.sh

# Run the script
./scripts/start-supabase.sh
```

This will:

1. Check if Docker is running
2. Start the local Supabase containers
3. Display the local URLs for Studio and API

## Default Credentials

Your local Supabase instance comes with these default credentials:

- **Studio URL**: <http://localhost:8000>
- **API URL**: <http://localhost:54321>
- **Default email**: <admin@admin.com>
- **Default password**: admin

The environment variables in `.env.local` have been updated to use these local endpoints.

## Creating Database Migrations

When you make schema changes in your local Supabase instance, you should create migrations to apply those changes to other environments.

Using Drizzle with Supabase:

```bash
# Generate migrations based on schema differences
pnpm drizzle-kit generate:pg

# Apply migrations
pnpm drizzle-kit push:pg
```

## Backing up Local Data

To back up your local Supabase database:

```bash
# Export database
docker exec -t supabase_db_1 pg_dump -U postgres -d postgres > supabase_backup.sql

# Import database (if needed)
cat supabase_backup.sql | docker exec -i supabase_db_1 psql -U postgres -d postgres
```

## Troubleshooting

- **Can't connect to Supabase**: Ensure Docker is running and containers are up (`docker ps`)
- **Database changes not reflecting**: Restart the Supabase containers
- **Studio not loading**: Check Docker logs (`docker logs supabase_studio_1`)

## Additional Resources

- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
