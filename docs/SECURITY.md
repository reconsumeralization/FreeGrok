# Security Best Practices

This document outlines security best practices for this project, particularly regarding handling of credentials and sensitive information.

## Database Credentials

### ❌ Don't

- Hardcode credentials in source code
- Store plain text passwords in version control
- Use default or weak passwords for databases

### ✅ Do

- Use environment variables for all credentials
- Use different credentials per environment (dev, staging, production)
- Ensure strong passwords for all database users
- Use least-privilege database accounts for applications

## Environment Variables

### Setup

1. Copy `.env.example` to `.env.development` (for local development)
2. Fill in with your actual credentials
3. **Never commit** your actual `.env.development` or `.env.production` files

### Available Variables

- `DB_HOST` - Database hostname
- `DB_PORT` - Database port
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - PostgreSQL system database name
- `TARGET_DB_NAME` - The application database to create
- `DATABASE_URL` - Connection string (derived from the above values)

## Supabase Security

When using Supabase (locally or in production):

1. Never hardcode API keys or service role keys
2. Use Row-Level Security (RLS) policies for all tables
3. Follow the principle of least privilege for database roles
4. Rotate keys regularly in production environments

## Secure Coding Guidelines

1. Use parameterized queries to prevent SQL injection
2. Validate and sanitize all user inputs
3. Implement proper authentication and authorization
4. Keep dependencies updated to avoid known vulnerabilities
5. Use HTTPS for all communications in production

## Security Scanning

This project uses CodeQL to scan for security vulnerabilities. Common issues to watch for:

- Hardcoded credentials (like passwords and API keys)
- SQL injection vulnerabilities
- Cross-site scripting (XSS) vulnerabilities
- Insecure direct object references
- Unvalidated redirects
