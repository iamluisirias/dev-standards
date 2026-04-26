# Git Hooks & Project Setup

> Reference doc — fetch only when setting up a new project or troubleshooting commit failures.

This doc covers the full setup for pnpm enforcement, Husky, lint-staged, and commitlint. Together they enforce two things on every commit:
1. **Biome** runs on staged files — a commit with lint or format errors is rejected.
2. **commitlint** validates the commit message — a malformed message is rejected.

Neither check can be skipped without explicitly bypassing Husky. Bypassing (`--no-verify`) is forbidden except in documented emergencies.

---

## 1. pnpm enforcement

### Install pnpm via corepack

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Pin the version in `package.json`

```json
{
  "packageManager": "pnpm@10.0.0"
}
```

Update this field whenever pnpm is upgraded.

### Block other package managers with `only-allow`

```bash
pnpm add -D only-allow
```

```json
{
  "scripts": {
    "preinstall": "only-allow pnpm"
  }
}
```

`only-allow` runs before any install command. Invoking `npm install` or `yarn` prints an error and exits before installing anything.

```bash
$ npm install
> preinstall
> only-allow pnpm

Use "pnpm install" to install dependencies.
```

### pnpm command reference

| Task | Command |
|---|---|
| Install all dependencies | `pnpm install` |
| Add a dependency | `pnpm add [package]` |
| Add a dev dependency | `pnpm add -D [package]` |
| Remove a dependency | `pnpm remove [package]` |
| Run a script | `pnpm [script]` |
| Run a one-off binary | `pnpm dlx [package]` |

- Commit `pnpm-lock.yaml` — never `.gitignore` it.
- Never delete `pnpm-lock.yaml` and regenerate it without a documented reason.

---

## 2. Husky, lint-staged, commitlint

### Install

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### Initialise Husky

```bash
pnpm dlx husky init
```

This creates `.husky/` and adds a `prepare` script to `package.json`. Do not remove the `prepare` script.

---

## 3. Pre-commit hook (Biome via lint-staged)

### Configure lint-staged in `package.json`

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

- `--write` applies safe auto-fixes (formatting, import organisation) before the check.
- `--no-errors-on-unmatched` prevents failure when no staged files match the pattern.
- The glob must match `biome.json`'s `files.includes` — keep them in sync.

### `.husky/pre-commit`

```sh
pnpm exec lint-staged
```

### What happens on every commit

1. Finds all staged files matching `src/**/*.{js,jsx,ts,tsx}`.
2. Runs `biome check --write` on those files only.
3. Biome auto-fixes formatting and import order, then re-stages the fixed files.
4. If unfixable lint errors remain, the commit is rejected and errors are printed.

---

## 4. Commit-msg hook (commitlint)

### `commitlint.config.js`

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "refactor", "style", "test", "docs", "chore"]],
    "scope-empty": [2, "never"],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
  },
};
```

| Rule | Effect |
|---|---|
| `type-enum` | Only the seven approved types are accepted |
| `scope-empty` | Scope is required — `feat: add thing` is rejected |
| `subject-case` | Description must be lowercase |
| `subject-full-stop` | Description must not end with a period |
| `header-max-length` | First line must not exceed 100 characters |

### `.husky/commit-msg`

```sh
pnpm exec commitlint --edit $1
```

---

## 5. Commit conventions

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

| Type | When to use |
|---|---|
| `feat` | New feature visible to the user |
| `fix` | Bug fix |
| `refactor` | Code restructuring with no behaviour change |
| `style` | Formatting, whitespace, naming — no logic change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |

- Scope is the feature name or area: `feat(seguro-vehiculo): add vehicle query options`
- Description: lowercase, imperative, no period — `add`, `fix`, `remove` not `added`, `fixes`, `removed.`
- One concern per commit.
- Breaking changes: `feat(auth)!: replace session with JWT` + `BREAKING CHANGE:` in footer.

---

## 6. Final `package.json` shape

```json
{
  "scripts": {
    "prepare": "husky",
    "preinstall": "only-allow pnpm"
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  },
  "devDependencies": {
    "@commitlint/cli": "...",
    "@commitlint/config-conventional": "...",
    "husky": "...",
    "lint-staged": "...",
    "only-allow": "..."
  }
}
```

---

## 7. Bypassing hooks

`--no-verify` is forbidden in normal workflow. It exists only for genuine emergencies (e.g. fixing a broken `main` under time pressure). If used, the commit body must document the reason and reference an issue:

```
fix(ci): revert broken migration

Emergency bypass — Biome failing due to unresolved peer dep conflict.
Tracked in: #123
```

Any `--no-verify` commit reaching the remote without a documented reason is a process violation.
