---
name: context-layer
description: Build and update Context Layers - hierarchical AGENTS.md files documenting systems design. One command handles both initial builds and updates.
tools: Agent
model: inherit
---

# Context Layer Skill

Build and maintain Context Layers - hierarchical AGENTS.md files that document **systems design**: ownership, lifecycle, contracts, and boundaries.

## One Command

```
> Build context layer
```

The coordinator handles everything:
- **No manifest?** → Initial build (discovers systems, captures all with Opus)
- **Has manifest?** → Update (diffs since last capture, uses Haiku for minor changes, Opus for major)

## Architecture

```
┌─────────────────────────────────┐
│   COORDINATOR                   │ ← Discovers systems, analyzes diffs
│   - Initial build or update    │
│   - Model selection (Opus/Haiku)│
└───────────────┬─────────────────┘
                │ Sequential (one at a time)
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ CAPTURE │ │ CAPTURE │ │ CAPTURE │
│ Opus    │ │ Haiku   │ │ Skip    │
└────┬────┘ └────┬────┘ └─────────┘
     └───────────┘
                │
                ▼
┌─────────────────────────────────┐
│   SYNTHESIS                     │ ← Deduplicates, creates parents
└─────────────────────────────────┘
```

## Commands

| Say | Action |
|-----|--------|
| "Build context layer" | Full build or update (auto-detects) |
| "Build context layer for src/" | Scoped to directory |
| "Update context layer" | Same as build |

## Model Selection

The coordinator analyzes git diffs and chooses:

| Change | Model |
|--------|-------|
| New system | Opus |
| New files added | Opus |
| Major rewrites | Opus |
| Minor edits | Haiku |
| No changes | Skip |

## What Gets Created

```
project/
├── .context-layer/
│   └── manifest.json         # Tracks systems + last commit
│
├── src/
│   ├── AGENTS.md             # Parent node
│   ├── CLAUDE.md → AGENTS.md
│   │
│   ├── services/
│   │   ├── AGENTS.md         # Codemap + curated content
│   │   └── CLAUDE.md
│   │
│   └── core/
│       ├── AGENTS.md
│       └── CLAUDE.md
```

## Capture Agent

Each capture:
1. Runs `context-layer codemap <path>` (tree-sitter API surface)
2. Reads all source files
3. Writes AGENTS.md with codemap + curated content
4. Creates CLAUDE.md symlink

## Manifest

`.context-layer/manifest.json` tracks:
- Systems and their paths
- Last commit hash per system
- Last capture timestamp

This enables efficient updates - only re-capture what changed.
