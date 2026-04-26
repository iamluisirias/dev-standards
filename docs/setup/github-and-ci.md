# GitHub & CI

> Reference doc — fetch only when creating a new repository, setting up CI, or reviewing contribution rules.

---

## Branching strategy

| Branch | Purpose |
|---|---|
| `main` | Production. Only receives merges from `develop` or emergency hotfixes. |
| `develop` | Integration branch. All feature work targets here first. |
| `feat/*` | New features. Branched from `develop`. |
| `fix/*` | Bug fixes. Branched from `develop`. |
| `hotfix/*` | Critical production fixes. Branched from `main`, merged to both `main` and `develop`. |
| `chore/*` | Tooling, dependencies, config. Branched from `develop`. |
| `refactor/*` | Code restructuring. Branched from `develop`. |

Branch names follow the same type vocabulary as Conventional Commits and must include the scope:

```
feat/seguro-vehiculo-quote-recovery
fix/steps-store-reset-on-category-change
chore/update-tanstack-query-v5
```

**Rules:**
- Never commit directly to `main` or `develop`.
- Delete the feature branch after merge.
- A `hotfix/*` branch must merge to both `main` and `develop` before deletion.

---

## Pull request template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What does this PR do?

<!-- One paragraph. What changed and why. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] refactor — no behaviour change
- [ ] style — formatting or naming only
- [ ] test — tests only
- [ ] docs — documentation only
- [ ] chore — tooling, deps, config

## How to test

<!-- Actionable steps to verify this works. If not applicable, write "N/A" and explain why. -->

## Checklist

- [ ] Follows conventions in the core notebook
- [ ] No commented-out code or debug statements
- [ ] No `console.log` remaining
- [ ] Loading, empty, and error states handled (if applicable)
- [ ] Accessibility not regressed (keyboard nav, ARIA)
- [ ] Commit messages follow Conventional Commits
```

**Rules for filling this template:**
- "What does this PR do?" must be a real description, not a restatement of the branch name.
- Every checklist item must be checked before the PR is opened.
- "How to test" must contain actionable steps — "it works" is not a test description.

---

## CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
      - develop

jobs:
  ci:
    name: Lint, typecheck & build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false

      - name: Get pnpm store path
        id: pnpm-cache
        run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Cache pnpm store
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: ${{ runner.os }}-pnpm-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Biome check
        run: pnpm exec biome check --no-errors-on-unmatched src/

      - name: Typecheck
        run: pnpm exec tsc --noEmit

      - name: Build
        run: pnpm run build
```

Typecheck and build are separate steps so a type error fails fast with a clean message before Vite attempts the bundle.

### Rules

- CI must pass before a PR can be merged — a failing check blocks merge regardless of approvals.
- At least 1 approval required in addition to passing CI.
- CI runs on every push to an open PR, not just on open.
- Never merge with a skipped or cancelled CI run.

---

## Repository settings

Configure these on every new repository:

**Branch protection for `main` and `develop`:**
- Require a pull request before merging — enabled.
- Require approvals — 1 minimum.
- Require status checks to pass before merging — enabled. Select the `ci` job.
- Require branches to be up to date before merging — enabled.
- Do not allow bypassing the above settings — enabled.

Without these settings the workflow is advisory only — anyone can push directly to `main`.

---

## PR size guidelines

| Size | Lines changed | Guidance |
|---|---|---|
| Small | < 200 | Ideal — fast to review, easy to reason about |
| Medium | 200–500 | Acceptable — add extra context to the description |
| Large | > 500 | Split if possible — if not, explain why in the PR description |

A PR over 500 lines warrants stopping to assess whether the task should be split before proceeding.
