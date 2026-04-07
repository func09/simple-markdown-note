# Simple Markdown Note

by @func09

**[https://simplemarkdownnote.func09.org](https://simplemarkdownnote.func09.org)**

A fast, lightweight, and cross-platform markdown note-taking application designed for simplicity and seamless synchronization.

| macOS | iOS |
| :---: | :---: |
| ![Screenshot App](https://func09.github.io/simple-markdown-note/screenshot-app.png) | ![Screenshot Mobile](https://func09.github.io/simple-markdown-note/screenshot-ios.png) |


**Supported platforms:**

- Web
- iOS
- macOS

## Starting the Development Environment

This project uses pnpm workspaces. You can run the applications directly in your local environment.

### 1. Initial Setup (Dependencies, Env, Database)

Run the following command at the project root:

> [!NOTE]
> Please review and update the generated `.env` files as necessary to match your specific local environment.

```bash
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/desktop/.env.example apps/desktop/.env
cp apps/mobile/.env.example apps/mobile/.env

# Initialize and seed the local D1 database
pnpm -F database db:generate:migration
pnpm -F api db:migrate
pnpm -F database db:seed
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

- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:8787](http://localhost:8787)

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

### 4. Code Formatting & Linting

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

### 5. Build and Cache

Turborepo speeds up builds and tests across the entire project through caching.
Once a task is executed, the result is returned instantly from the cache as long as the files have not changed.

```bash
pnpm build
```

## 6. Test Coverage

[![Web Coverage](https://func09.github.io/simple-markdown-note/web-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![API Coverage](https://func09.github.io/simple-markdown-note/api-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Desktop Coverage](https://func09.github.io/simple-markdown-note/desktop-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Mobile Coverage](https://func09.github.io/simple-markdown-note/mobile-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
<br />
[![Schemas Coverage](https://func09.github.io/simple-markdown-note/schemas-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Database Coverage](https://func09.github.io/simple-markdown-note/database-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Api-client Coverage](https://func09.github.io/simple-markdown-note/api-client-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)
[![Emails Coverage](https://func09.github.io/simple-markdown-note/emails-coverage.svg)](https://github.com/func09/simple-markdown-note/actions)

## License

This project is licensed under the [MIT License](LICENSE.md).
