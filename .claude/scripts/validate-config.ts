import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "../..");

type Result = { ok: boolean; message: string };

function pass(message: string): Result {
  return { ok: true, message: `  ✓ ${message}` };
}

function fail(message: string): Result {
  return { ok: false, message: `  ✗ ${message}` };
}

function readJson<T>(relativePath: string): T | null {
  const fullPath = resolve(root, relativePath);
  if (!existsSync(fullPath)) return null;
  return JSON.parse(readFileSync(fullPath, "utf-8")) as T;
}

// ── Checks ────────────────────────────────────────────────────────────────────

function checkHookFilesExist(): Result[] {
  const required = [
    ".claude/hooks/pre-bash.hook.ts",
    ".claude/hooks/pre-write.hook.ts",
    ".claude/hooks/audit-log.hook.ts",
  ];

  return required.map((file) =>
    existsSync(resolve(root, file))
      ? pass(`Hook file exists: ${file}`)
      : fail(`Hook file missing: ${file}`)
  );
}

function checkAgentFilesExist(): Result[] {
  const required = [
    ".claude/agents/reviewer.md",
    ".claude/agents/committer.md",
    ".claude/agents/scaffolder.md",
    ".claude/agents/tester.md",
    ".claude/agents/memory/reviewer-context.md",
  ];

  return required.map((file) =>
    existsSync(resolve(root, file))
      ? pass(`Agent file exists: ${file}`)
      : fail(`Agent file missing: ${file}`)
  );
}

function checkSkillFilesExist(): Result[] {
  const required = [
    ".claude/skills/commit/SKILL.md",
    ".claude/skills/review-pr/SKILL.md",
    ".claude/skills/scaffold-feature/SKILL.md",
    ".claude/skills/add-backend-step/SKILL.md",
    ".claude/skills/add-product-category/SKILL.md",
  ];

  return required.map((file) =>
    existsSync(resolve(root, file))
      ? pass(`Skill file exists: ${file}`)
      : fail(`Skill file missing: ${file}`)
  );
}

type HookEntry = { matcher?: string; hooks: { type: string; command?: string }[] };
type Settings = {
  hooks?: {
    PreToolUse?: HookEntry[];
    PostToolUse?: HookEntry[];
    SubagentStart?: HookEntry[];
    SubagentStop?: HookEntry[];
  };
  enabledMcpjsonServers?: string[];
};

function checkSettings(): Result[] {
  const settings = readJson<Settings>(".claude/settings.json");

  if (!settings) {
    return [fail(".claude/settings.json not found")];
  }

  const results: Result[] = [];
  const preToolUse = settings.hooks?.PreToolUse ?? [];
  const postToolUse = settings.hooks?.PostToolUse ?? [];

  const hasBashHook = preToolUse.some(
    (e) =>
      e.matcher === "Bash" &&
      e.hooks.some((h) => h.command?.includes("pre-bash.hook.ts"))
  );
  results.push(
    hasBashHook
      ? pass("PreToolUse Bash → pre-bash.hook.ts")
      : fail("PreToolUse Bash hook missing or misconfigured in settings.json")
  );

  const hasWriteHook = preToolUse.some(
    (e) =>
      e.matcher === "Write|Edit|MultiEdit" &&
      e.hooks.some((h) => h.command?.includes("pre-write.hook.ts"))
  );
  results.push(
    hasWriteHook
      ? pass("PreToolUse Write|Edit|MultiEdit → pre-write.hook.ts")
      : fail("PreToolUse Write hook missing or misconfigured in settings.json")
  );

  const hasAuditHook = postToolUse.some(
    (e) =>
      e.matcher === "Bash|Write|Edit|MultiEdit" &&
      e.hooks.some((h) => h.command?.includes("audit-log.hook.ts"))
  );
  results.push(
    hasAuditHook
      ? pass("PostToolUse → audit-log.hook.ts")
      : fail("PostToolUse audit hook missing or misconfigured in settings.json")
  );

  const subagentStart = settings.hooks?.SubagentStart ?? [];
  const hasSubagentStartAudit = subagentStart.some((e) =>
    e.hooks.some((h) => h.command?.includes("audit-log.hook.ts"))
  );
  results.push(
    hasSubagentStartAudit
      ? pass("SubagentStart → audit-log.hook.ts")
      : fail("SubagentStart audit hook missing or misconfigured in settings.json")
  );

  const subagentStop = settings.hooks?.SubagentStop ?? [];
  const hasSubagentStopAudit = subagentStop.some((e) =>
    e.hooks.some((h) => h.command?.includes("audit-log.hook.ts"))
  );
  results.push(
    hasSubagentStopAudit
      ? pass("SubagentStop → audit-log.hook.ts")
      : fail("SubagentStop audit hook missing or misconfigured in settings.json")
  );

  const enabledServers = settings.enabledMcpjsonServers ?? [];
  results.push(
    enabledServers.includes("context7")
      ? pass('enabledMcpjsonServers includes "context7"')
      : fail('"context7" missing from enabledMcpjsonServers in settings.json')
  );

  return results;
}

type McpJson = { mcpServers?: Record<string, unknown> };

function checkMcpJson(): Result[] {
  const mcp = readJson<McpJson>(".mcp.json");

  if (!mcp) return [fail(".mcp.json not found")];

  return [
    mcp.mcpServers?.context7
      ? pass("context7 defined in .mcp.json")
      : fail("context7 missing from .mcp.json"),
  ];
}

// ── Runner ────────────────────────────────────────────────────────────────────

const sections: { label: string; results: Result[] }[] = [
  { label: "Hook files", results: checkHookFilesExist() },
  { label: "Agent files", results: checkAgentFilesExist() },
  { label: "Skill files", results: checkSkillFilesExist() },
  { label: "settings.json", results: checkSettings() },
  { label: ".mcp.json", results: checkMcpJson() },
];

let failed = false;

for (const { label, results } of sections) {
  console.log(`\n${label}`);
  for (const { ok, message } of results) {
    console.log(message);
    if (!ok) failed = true;
  }
}

if (failed) {
  console.log("\n[FAIL] Claude Code configuration has drift. Fix the issues above.\n");
  process.exit(1);
} else {
  console.log("\n[OK] Claude Code configuration is valid.\n");
  process.exit(0);
}
