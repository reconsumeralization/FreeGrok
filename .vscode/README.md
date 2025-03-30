# Development Environment Setup

This project has been optimized for development with Cursor. Follow these guidelines to get the most out of your development experience.

## Cursor Configuration

This workspace includes optimized settings for Cursor's AI features:

- **Automatic Linting Resolution**: Cursor will attempt to fix linting errors automatically
- **Tab Completion**: Enhanced with project-specific context
- **Context Intelligence**: MCP configuration for accessing documentation from Supabase, Drizzle, and Next.js

## IDE Extensions

Make sure to install the recommended extensions when prompted. Key extensions include:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Path Intellisense

## Custom Snippets

This project includes custom code snippets to accelerate development. Use these prefixes in TypeScript/JavaScript files:

- `npage` - Create a Next.js page with metadata
- `nsc` - Create a Next.js Server Component
- `ncc` - Create a Next.js Client Component
- `dzcrud` - Create Drizzle CRUD operations
- `dztable` - Create a Drizzle schema table with Zod validation
- `napi` - Create a Next.js API route handler

## Debugging

Launch configurations are provided for:

- **Next.js: debug server-side**: Debug server components and API routes
- **Next.js: debug client-side**: Debug client components in the browser
- **Next.js: debug full stack**: Combined debugging for both client and server

## Getting Started

1. Install dependencies: `pnpm install`
2. Start development server: `pnpm dev`
3. Run database migrations: `pnpm drizzle-kit push:pg`

## Modal Context Protocol

This project uses Cursor's MCP to provide contextual intelligence:

- Supabase documentation is automatically available when working with database files
- Drizzle ORM documentation is integrated for schema and query files
- Next.js and Auth.js documentation is accessible throughout the project

## Folder Structure

- `/app`: Next.js App Router
- `/components`: React components
- `/lib`: Utility functions
- `/db`: Database schema and queries
- `/drizzle`: Drizzle migrations and configuration

## Need Help?

Use Cursor's AI assistance by pressing `Cmd/Ctrl + K` on any line of code to get contextual help.
