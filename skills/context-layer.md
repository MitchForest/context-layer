---
name: context-layer
description: Build and maintain hierarchical Context Layers that document systems design - ownership, lifecycle, contracts, and boundaries. Triggers specialized subagents for discovery, capture, and synthesis. Use when asked to "build context layer", "maintain context layer", or "sync context layer".
tools: Agent
model: inherit
---

# Context Layer Skill

A skill for building and maintaining Context Layers - hierarchical AGENTS.md files that document **systems design**: ownership, lifecycle, input/output contracts, and boundaries. This gives AI agents the architectural understanding they need to work effectively on large codebases.

## How It Works

Context Layer uses a hierarchy of specialized subagents:

```
┌─────────────────────────────────┐
│   COORDINATOR                   │ ← Orchestrates everything
│   - Discovers systems           │
│   - Manages manifest            │
│   - Spawns other agents         │
└───────────────┬─────────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ CAPTURE │ │ CAPTURE │ │ CAPTURE │  ← Each system gets own agent
│ System1 │ │ System2 │ │ System3 │
└────┬────┘ └────┬────┘ └────┬────┘
     └───────────┴───────────┘
                │
                ▼
┌─────────────────────────────────┐
│   SYNTHESIS                     │ ← Deduplicates & organizes
│   - LCA optimization            │
│   - Adds downlinks              │
│   - Creates parent nodes        │
└─────────────────────────────────┘
```

---

## Commands

### Build Mode (from scratch)

> "Build context layer for apps/ios"

Creates a complete Context Layer:
1. Coordinator discovers all systems
2. Capture agents analyze each system in parallel
3. Synthesis agent deduplicates and organizes
4. Manifest created at `.context-layer/manifest.json`

### Maintain Mode (update existing)

> "Maintain context layer"
> "Sync context layer"
> "Update context layer"

Updates an existing Context Layer:
1. Coordinator loads existing manifest
2. Detects changes since last sync
3. Maintain agents update only changed nodes
4. Synthesis re-runs for hierarchy

### Check Mode (report only)

> "Check context layer"

Reports on staleness without making changes.

### Single System

> "Capture context for apps/ios/scribble/Core/Validation"

Captures just one system (uses capture agent directly).

### Build Pending

> "Build pending context layer systems"

Captures systems detected but not yet documented (tracked in manifest).

---

## Automatic Maintenance

When the CLI is installed, a git hook runs on every commit:

1. **Codemaps updated** — Tree-sitter regenerates API surfaces (instant, free)
2. **Changes analyzed** — CLI determines if curated content needs updating
3. **Haiku auto-runs** — Updates curated content automatically

No manual intervention required. The context layer stays in sync with your code.

**To use Opus instead of Haiku:**
```bash
export CONTEXT_LAYER_MODEL=opus
```

---

## What Gets Created

```
your-project/
├── .context-layer/
│   └── manifest.json          # Systems registry & hierarchy
│
├── AGENTS.md                  # Root node
├── CLAUDE.md → AGENTS.md      # Symlink for Claude Code
│
└── [target]/
    ├── AGENTS.md              # Parent node
    ├── CLAUDE.md → AGENTS.md
    │
    ├── System1/
    │   ├── AGENTS.md          # System node
    │   └── CLAUDE.md → AGENTS.md
    │
    └── System2/
        ├── AGENTS.md
        └── CLAUDE.md → AGENTS.md
```

---

## The Manifest

`.context-layer/manifest.json` tracks:

- All discovered systems
- Their interfaces (what they provide/consume)
- Last capture timestamps
- Token counts
- Hierarchy structure

This enables efficient maintenance - only re-capture what changed.

---

## Invocation

When you say any of:
- "Build context layer for [path]"
- "Create context layer for [path]"
- "Maintain context layer"
- "Sync context layer"
- "Update context layer"
- "Check context layer"

This skill triggers the coordinator agent, which orchestrates everything automatically.

**No questions asked. Pure self-discovery.**

