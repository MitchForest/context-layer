# Context Layer

**Self-documenting codebases for AI agents.**

Every new AI chat burns context discovering your codebase from scratch. Context Layer creates hierarchical `AGENTS.md` files that give agents instant understanding of your architecture, system boundaries, and integration contracts.

## TL;DR

```bash
# Install (run in your project root)
curl -fsSL https://raw.githubusercontent.com/MitchForest/context-layer/main/install/install.sh | bash
```

Then in Claude Code:

```
Build context layer
```

After major changes:

```
Build context layer
```

(Same command — it auto-detects what changed.)

---

## The Problem

AI agents don't remember between sessions. Each new conversation:
- Wastes tokens rediscovering the same patterns
- Makes mistakes from incomplete understanding
- Misses invariants not enforced in types
- Doesn't understand how systems connect

## The Solution

Context Layer creates a hierarchy of `AGENTS.md` files documenting:
- **Ownership**: What each system owns vs. borrows
- **Dependencies**: What depends on what
- **Integration contracts**: How systems communicate
- **Data flow**: How data moves through the system
- **Invariants**: Must/never rules not in the code

New agents read these files and instantly understand your architecture.

## Quick Start

### Install

```bash
curl -fsSL https://raw.githubusercontent.com/MitchForest/context-layer/main/install/install.sh | bash
```

This copies agents and skills to your `.claude/` directory.

### Build Your Context Layer

Open Claude Code and say:

```
Build context layer
```

The coordinator agent:
1. **Discovers** functional systems in your codebase
2. **Spawns capture agents** (sequentially) for each system
3. **Runs synthesis** to document architecture and deduplicate

### Update Later

Same command:

```
Build context layer
```

The coordinator detects the existing manifest and:
- Analyzes git diffs since last capture
- Skips unchanged systems
- Uses **Haiku** for minor edits (fast, cheap)
- Uses **Opus** for new/major changes (thorough)

### Review & Fix

Grade your documentation quality:

```
Review context layer
```

The coordinator checks all AGENTS.md files against quality requirements and produces a structured report card.

Fix any issues found:

```
Fix context layer issues
```

The coordinator re-runs captures with specific instructions for each file that has issues—no manual intervention needed.

## How It Works

```
┌─────────────────────────────────────────┐
│         COORDINATOR (Opus)               │
│  - Discovers systems                     │
│  - Analyzes git diffs for updates        │
│  - Chooses Opus vs Haiku per capture    │
└───────────────┬─────────────────────────┘
                │ Sequential (as many as needed)
    ┌───────────┼───────────┬─────────┐
    ▼           ▼           ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐  ...
│ CAPTURE │ │ CAPTURE │ │ CAPTURE │
│ (Opus)  │ │ (Haiku) │ │ (Opus)  │
└────┬────┘ └────┬────┘ └────┬────┘
     └───────────┴───────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          SYNTHESIS (Opus)                │
│  - Builds system integration map         │
│  - Creates architecture diagrams         │
│  - Documents data flow                   │
│  - Deduplicates shared conventions       │
│  - Creates parent nodes with downlinks   │
└─────────────────────────────────────────┘
```

### Coordinator Agent

Orchestrates the entire process:
- Checks for existing manifest (build vs update)
- Discovers functional systems worth documenting
- Skips presentational/data-only code
- Spawns capture agents one at a time
- Selects model based on change analysis

### Capture Agent

Documents a single system:
- Reads all source files
- Greps for imports/dependencies
- Documents ownership, scope, lifecycle
- Maps integration contracts with other systems
- Creates `AGENTS.md` with curated knowledge

### Synthesis Agent

Creates the architecture view:
- Aggregates dependencies from all captures
- Builds system integration map
- Creates parent nodes with:
  - Architecture diagrams
  - Data flow documentation
  - System boundaries
- Deduplicates shared conventions to LCA
- Adds downlinks throughout hierarchy
- Preserves user-authored Rules sections

## Adding Rules

Code-derived knowledge is captured automatically. But user-authored rules emerge over time:

```
> Never use `any` type
> Always get approval before schema changes
> Ask before adding caching layers
> Prefer composition over inheritance
```

**Prefix markers indicate flexibility:**

| Prefix | Meaning |
|--------|---------|
| **Never** | Absolute prohibition |
| **Always** | Must do this |
| **Prefer** | Default, exceptions with justification |
| **Ask first** | Get permission before proceeding |
| **Avoid** | Soft rule, use judgment |

The `add-rule` skill:
- Adds to the appropriate AGENTS.md (root or scoped)
- Creates a `## Rules` section if needed
- Preserved by synthesis (never overwritten)
- Suggests LCA elevation when same rule exists in multiple files

## What Gets Created

```
project/
├── .context-layer/
│   └── manifest.json         # Tracks systems + last commit
│
├── src/
│   ├── AGENTS.md             # Architecture: diagram, data flow, boundaries
│   ├── CLAUDE.md → AGENTS.md
│   │
│   ├── services/
│   │   ├── AGENTS.md         # Dependencies, integration contracts
│   │   └── CLAUDE.md
│   │
│   ├── core/
│   │   ├── AGENTS.md         # Ownership, invariants
│   │   └── CLAUDE.md
│   │
│   └── features/
│       ├── AGENTS.md
│       └── CLAUDE.md
```

### Example Parent Node (Architecture)

```markdown
# Backend

> Owns all server-side business logic and external integrations.

## System Architecture

┌─────────────────────────────────────────┐
│                  API                     │
│  ┌──────────┐    ┌──────────┐           │
│  │   Auth   │───▶│   Users  │           │
│  └────┬─────┘    └────┬─────┘           │
│       │               │                  │
└───────┼───────────────┼──────────────────┘
        │               │
        ▼               ▼
┌─────────────────────────────────────────┐
│                Database                  │
└─────────────────────────────────────────┘

## Data Flow

1. Request → API/Auth → validates session
2. API/Auth → API/Users → fetches user data
3. API/Users → Database → queries storage
4. Response flows back up

## System Boundaries

| System | Owns | Does NOT Own |
|--------|------|--------------|
| API | Request handling | Storage |
| Database | Persistence | Business logic |

## Related Context

- [api](./api/AGENTS.md) — Request handling, auth
- [database](./database/AGENTS.md) — Persistence layer
```

### Example Leaf Node (System)

```markdown
# UserService

> Owns user data persistence and session state.

## Scope

**Owns**: User CRUD, session management, password hashing

**Does NOT own**: HTTP handling, email sending, order management

## Dependencies

### This System Depends On

| System | What's Used | Contract |
|--------|-------------|----------|
| Core/Validation | Input validation | Sync, returns Result |
| Database | UserRepository | Persistence |

### Systems That Depend On This

| System | How It's Used |
|--------|---------------|
| API/Auth | Validates credentials |
| API/Users | CRUD operations |

## Key Invariants

- **Must**: Hash passwords before storage
- **Never**: Return password hash in API responses
- **Assumes**: Caller has validated session
```

## Quality Requirements

The agents enforce these standards:

### Leaf Nodes (Required)

| Section | Requirement |
|---------|-------------|
| **Dependencies** | Both directions: what it depends on AND what depends on it |
| **Cross-app deps** | If in a monorepo, document connections to other apps |
| **Key Invariants** | 2-3 invariants (or explicit "none beyond type constraints") |
| **Scope** | Explicit "Owns" and "Does NOT own" |

### Parent Nodes (Required)

| Section | Requirement |
|---------|-------------|
| **Data Flow** | At least one documented flow (entry → systems → result) |
| **System Architecture** | ASCII diagram showing relationships |
| **Related Context** | Downlinks to all child systems |

### Root Node (Monorepos)

| Section | Requirement |
|---------|-------------|
| **App Integration** | How apps communicate (and what they DON'T do) |
| **All parent requirements** | Data flow, architecture, downlinks |

The synthesis agent validates these and reports any missing sections.

## Compatibility

**Required**: Claude Code (for agent spawning)

**Benefits any AI tool** that reads `AGENTS.md` or `CLAUDE.md` files, including:
- Cursor
- GitHub Copilot
- Codex
- Any LLM-based coding assistant

## File Conventions

- `AGENTS.md` — Primary documentation file
- `CLAUDE.md` — Symlink to AGENTS.md (Claude Code compatibility)
- `.context-layer/manifest.json` — Tracks captured systems

## Philosophy

**Curated over generated.** Context Layer doesn't dump code structure—it captures institutional knowledge that code alone can't convey:
- Why systems are designed this way
- What boundaries exist and why
- How data flows through the system
- What invariants must hold

**Hierarchical loading.** Agents automatically get broad context (parent nodes) plus specific detail (current directory). No manual prompt engineering.

**Self-updating.** Run "Build context layer" whenever you want updates. The coordinator handles the rest.

**Feedback loop.** Run "Review context layer" to get a quality grade. Run "Fix context layer issues" to automatically improve any gaps.

## Feedback Loop

Context Layer includes a structured feedback mechanism:

```
┌─────────────────────────────────────┐
│         "Review context layer"       │
│                                      │
│  Grades all AGENTS.md files against  │
│  quality requirements:               │
│  - Dependencies (both directions)    │
│  - Key Invariants                    │
│  - Data Flow (parent nodes)          │
│  - App Integration (root)            │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│          Structured Report           │
│                                      │
│  ✅ 10/14 passing                    │
│  ❌ 4 files with issues              │
│                                      │
│  Saved to .context-layer/review.json │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      "Fix context layer issues"      │
│                                      │
│  Re-runs captures with SPECIFIC      │
│  instructions for each issue:        │
│  - "Add Key Invariants section"      │
│  - "Fix stale Consumed By reference" │
│  - Re-runs synthesis for parents     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         Automatic Verification       │
│                                      │
│  Re-runs review to confirm all       │
│  issues are resolved.                │
└─────────────────────────────────────┘
```

This is **non-fragile** because:
- Review uses a structured checklist (binary pass/fail)
- Issues are stored as JSON, not interpreted from natural language
- Fix mode passes specific, actionable instructions to capture agents
- Verification confirms the fixes worked

## License

MIT
