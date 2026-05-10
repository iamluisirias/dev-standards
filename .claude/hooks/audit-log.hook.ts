// ? PostToolUse — logs every tool call to .claude/audit.log.
// ? Never blocks. Exit 0 always.

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