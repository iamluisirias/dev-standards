# Security Hooks

> Reference doc — fetch when setting up a new repository or reviewing Claude Code safety configuration.

---

## What hooks are

Hooks are TypeScript scripts that Claude Code executes at specific points in its lifecycle. Unlike instructions in `CLAUDE.md` — which the model reads and may interpret — hooks run outside the model entirely. They are deterministic: a blocked action is blocked unconditionally, regardless of how the task is framed or what the model decides.

For safety-critical constraints, hooks are more reliable than instructions.

---

## Hook types

For the full list of valid hook events, see the [official documentation](https://code.claude.com/docs/en/hooks) — not duplicated here to avoid drift.

This project uses `PreToolUse` for all blocking rules, `PostToolUse` for audit logging, and `SubagentStart`/`SubagentStop` for subagent lifecycle logging.

Scripts are written in TypeScript and run via `pnpm dlx tsx` — no compilation step, works on macOS, Linux, and Windows.

---

## Configuration

Hooks are defined in `.claude/settings.json` at the repo root. Each hook is a shell command that receives the tool call as JSON on stdin. Exit code `0` means allow. Any non-zero exit code blocks the action and surfaces the hook's stderr to the agent.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx tsx .claude/hooks/pre-bash.hook.ts"
          }
        ]
      },
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx tsx .claude/hooks/pre-write.hook.ts"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash|Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx tsx .claude/hooks/audit-log.hook.ts"
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx tsx .claude/hooks/audit-log.hook.ts"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "pnpm dlx tsx .claude/hooks/audit-log.hook.ts"
          }
        ]
      }
    ]
  }
}
```

---

## Hook: `pre-bash.hook.ts` — Bash command filter

Blocks destructive or out-of-scope shell commands before they execute.

```ts
// .claude/hooks/pre-bash.hook.ts
// Receives the Claude Code tool call as JSON on stdin.
// process.exit(1) blocks the action. process.exit(0) allows it.

import { readFileSync } from "fs";

type ToolCall = {
  tool_name: string;
  tool_input: {
    command?: string;
  };
};

function block(reason: string): never {
  process.stderr.write(`BLOCKED: ${reason}\n`);
  process.exit(1);
}

const raw = readFileSync(0, "utf-8");
const input: ToolCall = JSON.parse(raw);
const command = input.tool_input.command ?? "";

// ── Destructive filesystem operations ────────────────────────────────────────
if (/rm\s+-rf|rm\s+--no-preserve-root/.test(command)) {
  block("Recursive or forced deletions are not permitted.");
}

if (/truncate\s+--size\s*0/.test(command)) {
  block("Destructive truncation is not permitted.");
}

// ── Git — protected branches ──────────────────────────────────────────────────
if (/git\s+push/.test(command)) {
  if (/\bmain\b|\bstaging\b|\bdev\b/.test(command)) {
    block("Direct push to main, staging or dev is not permitted. Open a PR.");
  }
}

if (/git\s+push\s+.*--force|git\s+push\s+.*-f\b/.test(command)) {
  block("Force push is not permitted.");
}

// ── Git — bypass Husky ────────────────────────────────────────────────────────
if (/git\s+commit\s+.*--no-verify|git\s+commit\s+.*-n\b/.test(command)) {
  block("Bypassing Husky hooks with --no-verify is not permitted.");
}

// ── Package management — unauthorised package managers ───────────────────────
if (/^\s*(npm\s+install|npm\s+i\b|yarn\s+add|yarn\s+install)/.test(command)) {
  block("Only pnpm is permitted as a package manager. Use: pnpm install.");
}

// ── Package management — runtime dependencies ─────────────────────────────────
if (/pnpm\s+add\b/.test(command) && !/pnpm\s+add\s+(-D|--save-dev)/.test(command)) {
  block(
    "Adding a runtime dependency requires explicit confirmation that the package is part of the approved stack. " +
    "Use pnpm add -D for dev dependencies."
  );
}

// ── Secrets ───────────────────────────────────────────────────────────────────
if (/(AUTH_TOKEN|API_KEY|SECRET|PASSWORD|PRIVATE_KEY)\s*=\s*["'][^"']{8,}/i.test(command)) {
  block("Potential secret detected in command. Never hardcode credentials.");
}

// ── Critical config files — shell edits ──────────────────────────────────────
if (/(tsconfig\.json|biome\.json|vite\.config\.(ts|js)|package\.json)/.test(command)) {
  if (/\bsed\s+-i|\bawk\b/.test(command)) {
    block("Modifying critical config files via shell commands requires manual approval.");
  }
}

process.exit(0);
```

---

## Hook: `pre-write.hook.ts` — File write filter

Blocks writes to files outside the permitted scope.

```ts
// .claude/hooks/pre-write.hook.ts
// Applies to Write, Edit, and MultiEdit tool calls.
// Blocks writes to files outside the permitted path allowlist.

import { readFileSync } from "fs";

type ToolCall = {
  tool_name: string;
  tool_input: {
    path?: string;
    file_path?: string;
  };
};

function block(reason: string): never {
  process.stderr.write(`BLOCKED: ${reason}\n`);
  process.exit(1);
}

const raw = readFileSync(0, "utf-8");
const input: ToolCall = JSON.parse(raw);
const filePath = input.tool_input.path ?? input.tool_input.file_path ?? "";

if (!filePath) {
  process.exit(0);
}

const allowedPatterns: RegExp[] = [
  /^src\//,
  /^\.claude\//,
  /^docs\//,
  /^\.github\//,
  /^\.husky\//,
  /^tsconfig/,
  /^vite\.config\./,
  /^biome\.json$/,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^commitlint\.config\./,
  /^\.env\.example$/,
  /^README\.md$/,
  /^CLAUDE\.md$/,
  /^\.mcp\.json$/,
];

const isAllowed = allowedPatterns.some((pattern) => pattern.test(filePath));

if (!isAllowed) {
  block(
    `Write to '${filePath}' is outside the permitted scope.\n` +
    `Permitted paths: src/, .claude/, docs/, .github/, .husky/, and root config files.`
  );
}

process.exit(0);
```

---

## Hook: `audit-log.hook.ts` — Audit logging

Logs every tool call and subagent lifecycle event to `.claude/audit.log`. Does not block anything.

```ts
// .claude/hooks/audit-log.hook.ts
// PostToolUse + SubagentStart/SubagentStop — logs every event to .claude/audit.log.
// Never blocks. Exit 0 always.

import { readFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

type ToolCall = {
  tool_name?: string;
  tool_input?: {
    command?: string;
    path?: string;
    file_path?: string;
  };
};

const raw = readFileSync(0, "utf-8");
const input: ToolCall = JSON.parse(raw);

const timestamp = new Date().toISOString();
const tool = input.tool_name ?? "unknown";
const toolInput = input.tool_input ?? {};

const summary = (
  toolInput.command ??
  toolInput.path ??
  toolInput.file_path ??
  "—"
).slice(0, 200);

const logPath = ".claude/audit.log";
const logDir = dirname(logPath);

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

appendFileSync(logPath, `${timestamp} | ${tool} | ${summary}\n`, "utf-8");

process.exit(0);
```

Add `.claude/audit.log` to `.gitignore` — it is a local record, not committed.

---

## File structure

```
.claude/
  settings.json              ← hook configuration
  hooks/
    pre-bash.hook.ts         ← Bash command filter (PreToolUse)
    pre-write.hook.ts        ← file write filter (PreToolUse)
    audit-log.hook.ts        ← audit logging (PostToolUse)
  audit.log                  ← gitignored, local only
```

No setup required beyond having Node and pnpm available — which is already guaranteed by the project. `tsx` is fetched on first run via `pnpm dlx` and cached automatically. All hooks use `readFileSync(0, "utf-8")` (file descriptor 0) for stdin, which is cross-platform compatible on macOS, Linux, and Windows.

Add `.claude/audit.log` to `.gitignore`:

```
.claude/audit.log
```

---

## What is blocked vs allowed

### Blocked unconditionally

| Action | Hook |
|---|---|
| `rm -rf` or `rm --no-preserve-root` | `pre-bash.hook.ts` |
| Force push (`git push --force`) | `pre-bash.hook.ts` |
| Direct push to `main`, `staging`, or `dev` | `pre-bash.hook.ts` |
| Commit with `--no-verify` (Husky bypass) | `pre-bash.hook.ts` |
| `npm install` or `yarn add` | `pre-bash.hook.ts` |
| Adding a runtime dependency without explicit confirmation | `pre-bash.hook.ts` |
| Hardcoded secrets in commands | `pre-bash.hook.ts` |
| Shell edits to `tsconfig.json`, `biome.json`, `vite.config.*` via `sed -i` or `awk` | `pre-bash.hook.ts` |
| Writes outside the permitted path allowlist | `pre-write.hook.ts` |

### Allowed

| Action | Notes |
|---|---|
| All reads | No restrictions on reading files |
| Writes inside `src/` | Full access |
| Writes to `docs/`, `.claude/`, `.github/`, `.husky/` | Full access |
| Writes to root config files | `tsconfig`, `vite.config`, `biome.json`, `package.json`, `.mcp.json`, etc. |
| `pnpm add -D` | Dev dependency installs are permitted |
| `git push` to feature branches | Permitted |
| `git commit` (with Husky running) | Permitted |

---

## Adding a new rule

1. Identify whether it is a Bash command rule (`pre-bash.hook.ts`) or a file path rule (`pre-write.hook.ts`).
2. Add the regex pattern with a comment explaining what it blocks and why.
3. Test locally:
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"YOUR_COMMAND"}}' | pnpm dlx tsx .claude/hooks/pre-bash.hook.ts
echo $?  # 0 = allowed, 1 = blocked
```
4. Document the new rule in the blocked/allowed table above.

---

## Override procedure — when a hook blocks something legitimately

Hooks are intentionally strict. If a hook blocks a command that is genuinely required, follow this process — never bypass with `--no-verify` or by editing the hook directly without review.

### Step 1 — Confirm the block is a false positive

Run the hook manually to read the exact block message:
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"YOUR_COMMAND"}}' | pnpm dlx tsx .claude/hooks/pre-bash.hook.ts
```

### Step 2 — Execute the command manually yourself

If the command is safe and necessary, run it yourself in the terminal — outside of Claude Code. Hooks only intercept Claude's tool calls, not your direct terminal input. This is the correct override path for one-off situations.

### Step 3 — If the block is a recurring false positive, update the hook

Open a PR that:
- Adds or relaxes the regex in the relevant hook
- Updates the blocked/allowed table in this doc
- Includes a comment in the hook code explaining the exception and why it is safe

Do not silently loosen rules without documentation. Another developer reading the hook should understand every decision.

### Step 4 — Escalate if uncertain

If you are unsure whether the block is intentional or a bug, open a discussion before touching the hook. The hook is the last line of defence — treat it accordingly.