# Tooling

> Read when: adding environment variables, configuring Biome, or writing tests.
> For pnpm project setup, Husky, lint-staged, or commitlint setup, see `docs/setup/git-hooks.md`.

---

## Environment variables

All environment variables use the `VITE_` prefix and are consumed exclusively via a single typed config object at `src/config/env.ts`. Direct use of `import.meta.env` anywhere else is forbidden.

```ts
// src/config/env.ts
import { parse, object, string, pipe, url } from "valibot";

const envSchema = object({
  apiBaseUrl: pipe(string(), url()),
  appEnv: string(),
});

export const env = parse(envSchema, {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appEnv: import.meta.env.VITE_APP_ENV,
});
```

**Rules:**
- All variables are validated at startup via Valibot. An invalid or missing variable throws immediately — never silently falls back to `undefined`.
- `.env` file naming: `SCREAMING_SNAKE_CASE` with `VITE_` prefix → `VITE_API_BASE_URL`.
- Config object keys: `camelCase` → `env.apiBaseUrl`.
- Never commit `.env` files. Always commit `.env.example` with every variable present but empty.
- Features access config by importing from `@/config/env` — never by reading `import.meta.env` directly.

---

## Linting and formatting (Biome)

Biome is the single tool for linting, formatting, and import organisation. Do not install or configure ESLint or Prettier alongside it.

### Formatting rules

| Setting | Value |
|---|---|
| Indent style | Spaces |
| Indent width | 2 |
| Line ending | LF |
| Quote style | Double |
| JSX quote style | Double |
| Trailing commas | Always |
| Semicolons | Always |
| Arrow parentheses | Always |
| Bracket same line | No |
| Bracket spacing | Yes |

### Linter

Biome's recommended ruleset is enabled. The following rules are explicitly activated on top of it:

| Rule | Why |
|---|---|
| `noDefaultExport` | Named exports only, enforced at the tool level |
| `noConsole` | No `console.log` in committed code |
| `noRestrictedImports` for `import.meta.env` outside `src/config/env.ts` | All env access goes through the typed config object |

Do not suppress rules with `// biome-ignore` without a documented reason written inline.

### Import organisation

Biome's `organizeImports` runs automatically. Do not manually order imports or add blank lines between import groups.

### Scope

Biome runs on `src/**/*.{js,jsx,ts,tsx}`. The generated route tree (`src/routeTree.gen.ts`) is explicitly excluded — never edit or lint it manually.

---

## Testing

Test files live inside the feature, in a `tests/` subfolder beside the code they cover.

```
src/features/contacts/
  components/contact-card.component.tsx
  hooks/use-contacts.hook.ts
  tests/
    contact-card.component.test.tsx
    use-contacts.hook.test.ts
```

File naming pattern: `[name].[type].test.ts` / `[name].[type].test.tsx`

| Layer | Test type |
|---|---|
| `hooks/` | Unit — test logic and state in isolation |
| `services/` | Unit — mock HTTP with msw |
| `components/` | Integration / a11y — test rendered output and user interaction |
| `queries/` | Integration — use a mocked query client |

### Conventions

```ts
// Describe block = component or function name
describe("UserProfileCard", () => {
  it("calls onSelect with the userId when clicked", () => { ... });
  it("renders a skeleton when isLoading is true", () => { ... });
});
```

- Tests must be deterministic. No `Math.random()` or `Date.now()` without mocking.
- Mock all external dependencies (APIs, third-party libraries).
- Test behaviour, not implementation. If a test breaks when you rename an internal variable without changing behaviour, the test is wrong.
