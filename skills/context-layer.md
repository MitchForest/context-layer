---
name: context-layer
description: Build and update Context Layers - hierarchical AGENTS.md files documenting systems architecture, ownership, and integration. One command handles both initial builds and updates.
tools: Agent
model: inherit
---

# Context Layer Skill

Build and maintain Context Layers - hierarchical AGENTS.md files that document **systems architecture**: ownership, dependencies, integration contracts, and data flow.

## Why Context Layers?

Every new AI chat/agent wastes context discovering the codebase from scratch. Context Layers pre-document:
- What each system owns vs. borrows
- How systems depend on and integrate with each other
- Data flow between components
- Invariants not enforced in types

New agents read AGENTS.md and instantly understand the architecture.

## One Command

```
> Build context layer
```

The coordinator handles everything:
- **No manifest?** → Initial build (discovers systems, captures all with Opus)
- **Has manifest?** → Update (diffs since last capture, uses Haiku for minor changes, Opus for major)

## What Gets Created

```
project/
├── .context-layer/
│   └── manifest.json         # Tracks systems + last commit
│
├── src/
│   ├── AGENTS.md             # Parent: architecture diagram, data flow
│   ├── CLAUDE.md → AGENTS.md
│   │
│   ├── services/
│   │   ├── AGENTS.md         # Dependencies, integration contracts
│   │   └── CLAUDE.md
│   │
│   └── core/
│       ├── AGENTS.md
│       └── CLAUDE.md
```

## Architecture

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
│  - Deduplicates to LCA                   │
│  - Creates parent nodes with downlinks   │
└─────────────────────────────────────────┘
```

## Commands

| Say | Action |
|-----|--------|
| "Build context layer" | Full build or update (auto-detects) |
| "Build context layer for src/" | Scoped to specific directory |
| "Update context layer" | Same as build |

## What Capture Documents

Each system's AGENTS.md includes:
- **Scope**: What it owns vs. doesn't own
- **Dependencies**: What it depends on, what depends on it
- **Integration contracts**: Data passed, lifecycle ownership
- **Initialization & lifecycle**: How created, singleton vs ephemeral
- **Invariants**: Must/never rules not in types

## What Synthesis Creates

Parent nodes document the architecture:
- **System diagrams**: Visual representation of relationships
- **Data flow**: How data moves between systems
- **Boundaries**: Where one system ends and another begins
- **Shared conventions**: Patterns that apply across children

## Manifest

`.context-layer/manifest.json` tracks:
- Systems and their paths
- Last commit hash per system
- Last capture timestamp

This enables efficient updates - only re-capture what changed.
