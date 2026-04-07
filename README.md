# Simple Markdown Note

by @func09

[![Web Coverage](https://func09.github.io/simple-markdown-note/web-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![API Coverage](https://func09.github.io/simple-markdown-note/api-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Desktop Coverage](https://func09.github.io/simple-markdown-note/desktop-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Mobile Coverage](https://func09.github.io/simple-markdown-note/mobile-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
<br />
[![Schemas Coverage](https://func09.github.io/simple-markdown-note/schemas-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Database Coverage](https://func09.github.io/simple-markdown-note/database-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Api-client Coverage](https://func09.github.io/simple-markdown-note/api-client-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Emails Coverage](https://func09.github.io/simple-markdown-note/emails-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)

## Starting the Development Environment

This project uses pnpm workspaces. You can run the applications directly in your local environment.

### 1. Install Dependencies

Run the following command at the project root:

```bash
pnpm install
```

### 2. Start the Applications (Turborepo)

Use Turborepo to run the API and Web frontend in parallel.

```bash
pnpm dev
```

If you also want to start the desktop app (Electron) simultaneously, add the `--native` flag:

```bash
pnpm dev --native
```

- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:8787](http://localhost:8787)
- **Drizzle Studio**: `pnpm -F database db:studio` (View the database contents in your browser)

### 3. Run Tests

You can run tests for each package.

**Run all project tests**

```bash
pnpm test
```

**Run tests with coverage**

```bash
pnpm test:cov
```

**Test a specific app only**

```bash
pnpm -F web test
# or
pnpm -F api test
```

### 4. Database Initialization & Synchronization

For the first startup or when the schema changes, synchronize the database using the following command:

```bash
pnpm -F database db:push
```

### 5. Insert Seed Data

Insert initial development data (test users and notes).

```bash
# Navigate to the database workspace and run
cd packages/database
pnpm generate
pnpm db:seed
```

### 6. Code Formatting & Linting

Run code formatting, linting, and type checking across the entire project.

```bash
# Run formatting and linting all at once (Biome)
pnpm check

# TypeScript type check
pnpm check:types

# JSDoc syntax check (ESLint)
pnpm check:docs

# Run all checks and tests after clearing the cache
pnpm check:all
```

### 7. Build and Cache

Turborepo speeds up builds and tests across the entire project through caching.
Once a task is executed, the result is returned instantly from the cache as long as the files have not changed.

```bash
pnpm build
```

## License

This project is licensed under the [MIT License](LICENSE.md).
