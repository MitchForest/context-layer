# Context Layer

**Build and maintain hierarchical context systems that give AI agents the knowledge they need to work effectively on large codebases.**

[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Compatible-blue)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Inspired by**: [The Intent Layer](https://www.intent-systems.com/learn/intent-layer) by Tyler Brandt at Intent Systems

---

## The Problem

The ceiling on AI results isn't model intelligence—it's what the model sees before it acts.

Your best engineers carry mental models: what each subsystem owns, what must never happen, where the real boundaries live. That knowledge accumulated over years of bugs, outages, and code reviews. It lives in heads and scattered docs, not in code.

When agents work on your codebase, they start from zero. Every request is a full onboarding—not just to your task, but to your entire system. On large codebases, agents can't fit everything into context. They fumble in the dark, learning only by what they bump into.

## The Solution

**Context Layer** captures that mental model in structured files (`AGENTS.md`) that auto-load when agents work in each area.

```
your-repo/
├── AGENTS.md              # Root: architecture, boundaries, principles
├── CLAUDE.md → AGENTS.md  # Symlink for Claude Code
│
├── apps/
│   ├── backend/
│   │   ├── AGENTS.md      # Backend: auth patterns, error codes
│   │   └── api/
│   │       └── AGENTS.md  # API: endpoints, validation rules
│   │
│   └── frontend/
│       └── AGENTS.md      # Frontend: state management, components
```

Each Context Node explains:
- **What this area owns** (and doesn't own)
- **Entry points and contracts**
- **Patterns to follow**
- **Anti-patterns to avoid**
- **Invariants that must never be violated**

Agents auto-load these nodes as they navigate your codebase, building up context before they touch code.

---

## Quick Start

### Install (30 seconds)

```bash
# From your project root
curl -sSL https://raw.githubusercontent.com/MitchForest/context-layer/main/install/install.sh | bash
```

This installs 4 specialized subagents that work together:
- **Coordinator** — Discovers systems, orchestrates everything
- **Capture** — Deep analysis of individual systems  
- **Maintain** — Updates existing nodes after code changes
- **Synthesis** — Deduplicates and organizes hierarchy

### Use

Just talk to your agent. No questions asked—pure self-discovery:

| Say This | What Happens |
|----------|--------------|
| "Build context layer for src/" | Full automated build with parallel capture |
| "Maintain context layer" | Updates only what changed |
| "Check context layer" | Reports staleness without changes |

### What You Get

```
your-project/
├── .context-layer/
│   └── manifest.json          # Systems registry
│
├── AGENTS.md                  # Root node
├── CLAUDE.md → AGENTS.md      # Symlink
│
└── src/
    ├── AGENTS.md              # Parent node
    │
    ├── auth/
    │   └── AGENTS.md          # System node
    │
    ├── api/
    │   └── AGENTS.md
    │
    ├── database/
    │   └── AGENTS.md
    │
    └── utils/
        └── AGENTS.md
```

---

## How It Works

### Subagent Architecture

Context Layer uses specialized subagents that each get their own context window:

```
User: "Build context layer for src/"
                    │
                    ▼
    ┌───────────────────────────────┐
    │   COORDINATOR                 │
    │   • Discovers "systems"       │
    │   • Creates manifest          │
    │   • Spawns capture agents     │
    └───────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    ┌─────────┐           ┌─────────┐
    │ CAPTURE │    ...    │ CAPTURE │  ← Parallel, separate contexts
    │ System1 │           │ SystemN │
    └─────────┘           └─────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │   SYNTHESIS                   │
    │   • Deduplicates to LCA       │
    │   • Creates parent nodes      │
    │   • Adds downlinks            │
    └───────────────────────────────┘
```

### Hierarchical Loading

When an agent works in a directory, it automatically loads:
1. The root `AGENTS.md`
2. All ancestor nodes up to the working directory
3. The node covering the current directory

This gives agents a **T-shaped view**: broad context at the top, specific detail where they're working.

### The Systems Manifest

`.context-layer/manifest.json` tracks:
- All discovered systems and their purposes
- Interface relationships (what provides/consumes what)
- Last capture timestamps for efficient maintenance
- Token counts and hierarchy structure

### LCA Optimization

Shared knowledge is automatically deduplicated to the **Least Common Ancestor**:

```
Before: Same fact in 3 leaf nodes (wasteful)
After:  Fact moved to parent node (loads once)
```

### Model Selection

All agents inherit the model from your main conversation:
- Using Opus? All subagents use Opus (deepest analysis)
- Using Sonnet? All subagents use Sonnet (good balance)
- Using Haiku? All subagents use Haiku (fastest)

To override, edit the agent files in `.claude/agents/` and change `model: inherit` to `model: opus` (or `sonnet`, `haiku`).

### Compression

A good Context Node distills a large area into minimal tokens:
- Root node: 2-3k tokens covers entire repo architecture
- Parent nodes: 500-1.5k tokens
- Leaf nodes: 800-1.5k tokens each

Total overhead: 10-15k tokens for a complete Context Layer on a large monorepo.

---

## Compatibility

### Building the Context Layer

**Use Claude Code** to build and maintain your Context Layer. The subagent architecture (Coordinator → Capture → Synthesis) requires Claude Code's agent spawning capabilities.

| Platform | Build Support | Notes |
|----------|---------------|-------|
| **Claude Code** | ✅ Tested | Full support for subagent spawning |
| **Cursor** | 🧪 Experimental | Has `.cursor/agents` but docs not finalized yet ([more info coming soon](https://forum.cursor.com)) |

### Using the Context Layer

Once built, the `AGENTS.md` files work with **any AI tool** that loads context files:

- ✅ Claude Code (loads `CLAUDE.md` automatically)
- ✅ OpenAI Codex (loads `AGENTS.md` automatically)  
- ✅ Cursor (loads `AGENTS.md` from project directories)
- ✅ GitHub Copilot
- ✅ Windsurf
- ✅ Amp
- ✅ Goose

**Workflow**: Use Claude Code to create/maintain your Context Layer, then any agent of your choosing benefits from the hierarchical `AGENTS.md` files.

---

## File Convention

| File | Purpose | Tool Support |
|------|---------|--------------|
| `AGENTS.md` | Primary context file | Codex, most tools |
| `CLAUDE.md` | Symlink to AGENTS.md | Claude Code |

Always create both: `AGENTS.md` as the source, `CLAUDE.md` as a symlink.

```bash
# In any directory with a context node
ln -s AGENTS.md CLAUDE.md
```

---

## Philosophy

Context Layer is inspired by Tyler Brandt's excellent article [The Intent Layer](https://www.intent-systems.com/learn/intent-layer) from Intent Systems. The core ideas:

1. **Compress context**: Distill large areas into minimal, high-signal tokens
2. **Surface hidden knowledge**: Capture what code can't express
3. **Progressive disclosure**: Load minimal context, drill in as needed
4. **Least Common Ancestor**: Shared knowledge lives at the shallowest covering node
5. **Maintenance flywheel**: Keep nodes in sync with code changes

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [Context Layer Contributors](LICENSE)

