# Agent Development Guide

## Commands

- `pnpm dev` - Start all dev servers
- `pnpm build` - Build all packages and apps
- `pnpm check` - Run all checks (format, lint, types)
- `pnpm check:types` - TypeScript type checking
- `pnpm check:docs` - JSDoc syntax checking (ESLint). **Note: All JSDoc comments MUST be written in Japanese.**
- `pnpm outdated -r` - List newer versions across the workspace (respects catalog and lockfile)

## Dependencies

- **pnpm catalog**: Pin shared versions in [`pnpm-workspace.yaml`](pnpm-workspace.yaml) under `catalog`. Depend on them from each package as `"catalog:"` in `package.json` so there is a single source of truth.
- **Root `pnpm.overrides`**: Only for transitive or security fixes (`markdown-it`, `esbuild`, `@tootallnate/once` in the root `package.json`). Revisit when auditing CVEs or lockfile issues; avoid duplicating catalog pins here.
- **Upgrade policy**: Use `pnpm outdated -r` before large bumps. Rows that jump a major (e.g. Expo 55, React Native 0.85) follow the mobile SDK roadmap, not “always latest”. Prefer small catalog edits in a dedicated change with `pnpm install`, then `pnpm check` / tests.
- **`apps/mobile` and TypeScript**: [`apps/mobile/package.json`](apps/mobile/package.json) sets `devDependencies.typescript` to `~5.9.3` **outside** the catalog on purpose. Expo SDK 54 is kept on TypeScript 5.9.x, while other packages use the catalog `typescript` (6.x). Do not switch this to `catalog:` without confirming Expo / RN compatibility.

## Code Style

- **TypeScript**: Strict mode enabled, all files must be typed
- **Formatting**: Biome, run `pnpm check --write`
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Use try-catch with proper error types, log errors appropriately
- **Testing**: All features require unit tests, use existing test framework per package
