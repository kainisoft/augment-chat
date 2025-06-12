# Next.js Chat Application

This is the Next.js implementation of the chat application web client.

## Quick Start

```bash
# Navigate to the Next.js directory
cd client/web/nextjs

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate GraphQL types
pnpm codegen

# Start development server
pnpm dev
```

## Development

- **Development Server**: `pnpm dev` - Starts the Next.js development server on http://localhost:3000
- **Build**: `pnpm build` - Creates an optimized production build
- **Test**: `pnpm test` - Runs the test suite
- **Type Check**: `pnpm type-check` - Runs TypeScript type checking
- **Lint**: `pnpm lint` - Runs ESLint

## Documentation

For detailed implementation information, see [NEXTJS_IMPLEMENTATION_PLAN.md](./NEXTJS_IMPLEMENTATION_PLAN.md).

## Backend Services

This client integrates with the following backend services:
- **Apollo Federation Gateway**: http://localhost:4000/graphql
- **WebSocket Gateway**: ws://localhost:4001
- **Authentication Service**: http://localhost:4002

Make sure these services are running before starting the client.
