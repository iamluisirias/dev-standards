# Reviewer context — [Project Name]

Known patterns, past findings, and project-specific decisions for the code reviewer.
Append new entries when a pattern is worth remembering across sessions.

---

## Anti-patterns found in this project

<!-- Document recurring violations with their fix date and the rule that applies.
Example:
### `import.meta.env` used outside the env config file
**Status:** Fixed (YYYY-MM-DD)
Description of what was wrong and how it was fixed.
-->

---

## Architecture decisions not documented in `docs/`

<!-- Record intentional deviations or non-obvious patterns specific to this codebase.
Example:
### Stream endpoint uses native `fetch`, not the shared HTTP client
`getStreamedQuotes` uses `fetch` directly because response streaming is incompatible with Axios. This is intentional.
-->

---

## Instructions for the reviewer

- Read this file before starting any review
- If you detect a new recurring pattern not covered in `docs/`, add it here with date and status
- Do not duplicate rules already in `docs/` — only record what is specific to this codebase and not documented elsewhere
