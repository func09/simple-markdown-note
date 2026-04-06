# Agent Development Guide

## Commands

- `pnpm dev` - Start all dev servers
- `pnpm build` - Build all packages and apps
- `pnpm check` - Run all checks (format, lint, types)
- `pnpm check:types` - TypeScript type checking
- `pnpm check:docs` - JSDoc syntax checking (ESLint). **Note: All JSDoc comments MUST be written in Japanese.**

## Code Style

- **TypeScript**: Strict mode enabled, all files must be typed
- **Formatting**: Biome, run `pnpm check --write`
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Use try-catch with proper error types, log errors appropriately
- **Testing**: All features require unit tests, use existing test framework per package
