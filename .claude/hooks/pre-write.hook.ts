// ? Applies to Write, Edit, and MultiEdit tool calls.
// ? Blocks writes to files outside the permitted path allowlist.

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
  // Structural directories — common across stacks
  /^src\//,
  /^app\//,
  /^lib\//,
  /^test\//,
  /^tests\//,
  /^e2e\//,
  /^scripts\//,
  /^public\//,
  /^static\//,
  /^template\//,
  /^\.claude\//,
  /^docs\//,
  /^\.github\//,
  /^\.husky\//,
  // Any root-level file (no path separator) — covers all config files regardless of stack
  /^[^/\\]+$/,
];

const isAllowed = allowedPatterns.some((pattern) => pattern.test(filePath));

if (!isAllowed) {
  block(
    `Write to '${filePath}' is outside the permitted scope.\n` +
    `Permitted paths: src/, .claude/, docs/, .github/, .husky/, and root config files.`
  );
}

process.exit(0);