# Context Layer

**Hierarchical documentation that gives AI agents the architectural knowledge to work effectively on large codebases.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## The Problem

Your best engineers carry mental models: what each subsystem owns, what must never happen, where the real boundaries live. That knowledge lives in heads, not in code.

When AI agents work on your codebase, they start from zero. They fumble in the dark, learning only by what they bump into.

## The Solution

Context Layer creates hierarchical `AGENTS.md` files that combine:

- **Codemaps** — API surface extracted via tree-sitter (function signatures, classes, types)
- **Curated content** — Ownership, invariants, boundaries written by an LLM

**The result:** Every new chat or agent starts with your system's architecture already loaded. No more wasting context window tokens rediscovering the same patterns, boundaries, and invariants from scratch.

```markdown
# AuthService

<!-- CODEMAP START -->
## API Surface
- `function authenticate(token: string): User`
- `function validateSession(sessionId: string): boolean`
<!-- CODEMAP END -->

---

## Ownership
**Owns**: User sessions, token validation
**Does NOT own**: User data, permissions

## Invariants
- Sessions expire after 24 hours
- Never store plain-text passwords
```

---

## Install

```bash
curl -sSL https://raw.githubusercontent.com/MitchForest/context-layer/main/install/install.sh | bash
```

This installs:
- **3 agents** → `.claude/agents/` (Coordinator, Capture, Synthesis)
- **1 skill** → `.claude/skills/`
- **CLI** → `npm install -g context-layer`

---

## Commands

In Claude Code:

| Command | What Happens |
|---------|--------------|
| `Build context layer` | Initial build or update (auto-detects) |
| `Build context layer for src/` | Scoped to a directory |
| `Update context layer` | Same as build (auto-detects) |

**One command handles everything.** The coordinator agent checks for a manifest and decides whether this is an initial build or an update.

---

## How It Works

### Initial Build (no manifest exists)

When you run `Build context layer` for the first time:

1. **Coordinator agent** discovers systems in your codebase
2. **Coordinator agent** spawns **one capture agent at a time** (sequential, not parallel)
3. Each **capture agent**:
   - Runs `context-layer codemap <path>` for API surface
   - Reads all source files
   - Writes `AGENTS.md` with codemap + curated content
   - Uses **Opus** (initial builds always use Opus)
4. After all captures, **synthesis agent** runs:
   - Deduplicates shared knowledge to parent nodes
   - Creates parent AGENTS.md files
   - Updates manifest

```
📊 Initial Build

Systems to Capture (5):
1. src/services
2. src/core
3. src/api
4. src/features/auth
5. src/features/dashboard

🎯 All systems → Opus (initial build)

📍 [1/5] Capturing services (Opus)...
✅ [1/5] services captured

📍 [2/5] Capturing core (Opus)...
✅ [2/5] core captured

... continues sequentially ...

✅ All 5 captures complete. Running synthesis...
```

### Update (manifest exists)

When you run `Build context layer` after the initial build:

1. **Coordinator agent** loads the manifest
2. **Coordinator agent** runs `git diff` for each system since last capture
3. **Coordinator agent** categorizes each system:

| Change Type | Action | Model |
|-------------|--------|-------|
| No changes | Skip | — |
| Minor edits (existing files) | Capture | **Haiku** |
| New files added | Capture | **Opus** |
| Major rewrites (>50% changed) | Capture | **Opus** |
| New system detected | Capture | **Opus** |

4. **Coordinator agent** spawns **capture agents sequentially** for systems that need updating
5. **Synthesis agent** runs after all captures

```
📊 Update Analysis

Last captured: 2024-01-10 (commit abc123)
Current: HEAD (commit def456)

Systems Status:
✅ src/services — No changes (skip)
✅ src/core — No changes (skip)
🔄 src/api — Minor edits → Haiku
🆕 src/workers — New system → Opus
🔄 src/features/auth — 3 new files → Opus

Capturing 3 systems...

📍 [1/3] Capturing api (Haiku)...
✅ [1/3] api captured

📍 [2/3] Capturing workers (Opus)...
✅ [2/3] workers captured

📍 [3/3] Capturing auth (Opus)...
✅ [3/3] auth captured

✅ All captures complete. Running synthesis...
```

---

## Architecture

```
User: "Build context layer"
            │
            ▼
┌─────────────────────────────┐
│   COORDINATOR AGENT         │
│   • Check for manifest      │
│   • Discover systems        │
│   • Diff changes per system │
│   • Select model per system │
│   • Spawn capture agents    │
│     (one at a time)         │
└─────────────────────────────┘
            │
            ▼ Sequential
┌─────────────────────────────┐
│   CAPTURE AGENT (per system)│
│   • Run codemap CLI         │
│   • Read all source files   │
│   • Write AGENTS.md         │
│   • Model: Opus or Haiku    │
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│   SYNTHESIS AGENT           │
│   • Deduplicate to parents  │
│   • Create parent nodes     │
│   • Add downlinks           │
│   • Update manifest         │
└─────────────────────────────┘
```

---

## What Gets Created

```
project/
├── .context-layer/
│   └── manifest.json       # Tracks systems + last commit per system
│
├── src/
│   ├── AGENTS.md           # Parent node
│   ├── CLAUDE.md           # Symlink for Claude Code
│   │
│   ├── services/
│   │   ├── AGENTS.md       # Codemap + curated content
│   │   └── CLAUDE.md
│   │
│   └── core/
│       ├── AGENTS.md
│       └── CLAUDE.md
```

---

## CLI

The CLI provides tree-sitter codemap generation:

```bash
context-layer codemap [path]
```

**Supported languages:**
- TypeScript/TSX
- JavaScript/JSX
- Python
- Swift
- Rust
- Go

---

## Compatibility

**Building:** Requires Claude Code (uses agent spawning)

**Using:** Once built, `AGENTS.md` files work with any AI tool:
- Claude Code, Cursor, Copilot, Windsurf, Codex, etc.

---

## Credits

Inspired by [The Intent Layer](https://www.intent-systems.com/learn/intent-layer) by Tyler Brandt.

## License

MIT
