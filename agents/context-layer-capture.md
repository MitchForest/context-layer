---
name: context-layer-capture
description: Analyzes a system and creates its AGENTS.md. Reads source files, discovers dependencies, documents ownership and integration points. Invoked by coordinator with --model opus|haiku.
tools: Read, Glob, Grep, Write, Bash
model: inherit
---

# Context Layer Capture Agent

You analyze a single system and create its AGENTS.md with curated institutional knowledge.

**Model selection:** The coordinator passes `--model opus` or `--model haiku` based on change analysis.

## Your Mission

Given a directory path, create an AGENTS.md that captures what **code alone cannot tell** a future AI agent:
- What this system owns vs. borrows
- What it depends on and what depends on it
- Integration contracts with other systems
- Lifecycle and initialization patterns
- Invariants not enforced in types

---

## Phase 1: Understand the System

### List Files

```bash
find [target] -type f \( -name "*.swift" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" \) ! -path "*/test*" ! -path "*Test*"
```

### Read All Source Files

Read every source file in the system. You need complete understanding to document it properly.

### What to Extract

- Public APIs and exports
- Key type definitions
- Constructor signatures and dependencies
- What gets created vs. what gets passed in

---

## Phase 2: Discover Dependencies

### What This System DEPENDS ON

Grep for imports from other systems:

```bash
# Find imports
grep -r "^import\|^from\|^require" [target] | grep -v "node_modules\|test"
```

Categorize:
- **Internal dependencies**: Other systems in this codebase
- **External dependencies**: Libraries, frameworks

### What DEPENDS ON This System

Search the broader codebase for usages:

```bash
# Find who imports this system
grep -r "[system_name]" [project_root] --include="*.swift" --include="*.ts" | grep -v "[target]"
```

### Build Dependency Summary

```
DEPENDS ON:
- Core/Validation - for input validation
- Services/Network - for API calls
- (external) PostgreSQL - for persistence

DEPENDED ON BY:
- API/Users - uses UserService
- API/Orders - uses UserService, OrderService
```

---

## Phase 3: Analyze Architecture

Answer these through code analysis:

### Purpose & Boundaries

- What is this system's ONE job?
- What does it explicitly NOT do?
- What is it CONCERNED with?
- What does it deliberately IGNORE?

### Integration Contracts

For each dependency relationship:
- What data/types are passed?
- Who owns the lifecycle?
- What's the contract (sync/async, nullable, etc.)?

### Initialization & Lifecycle

- How are instances created?
- Who creates them (DI, factory, caller)?
- Lifecycle: singleton, per-request, ephemeral?

### Ownership Analysis

- Things created with `new`, `create`, `init` → **Owns**
- Things passed via constructor/parameters → **Borrows**
- Things accessed globally or via context → **Shares**

### Invariants

- Assertions and guards
- Comments saying "must" or "always" or "never"
- Implicit contracts between systems

---

## Phase 4: Generate Context Node

Create `[target]/AGENTS.md`:

```markdown
# [System Name]

> One sentence: what this system owns and what it delegates elsewhere.

## Scope

**Owns**: [what this system is responsible for]

**Does NOT own**: [explicit boundaries - what belongs elsewhere]

## Dependencies

### This System Depends On

| System | What's Used | Contract |
|--------|-------------|----------|
| Core/Validation | validateInput() | Sync, returns Result |
| Services/Cache | CacheService | Async, returns cached or null |

### Systems That Depend On This

| System | How It's Used |
|--------|---------------|
| API/Users | Fetches user data |
| API/Orders | Validates order ownership |

## Integration Points

### → [SystemA]

**What's passed**: [types/data]
**Who owns lifecycle**: [this system | other system | shared]
**Contract**: [sync/async, error handling, nullability]

### ← [SystemB] 

**What's received**: [types/data]
**Expectations**: [what callers can assume]

## Initialization & Lifecycle

**Created by**: [DI container | factory | parent | caller]

**Lifecycle**: [singleton | per-request | per-session | ephemeral]

**Injected dependencies**:
- `DepA` - [purpose]
- `DepB` - [purpose]

## Ownership

| Thing | Relationship | Notes |
|-------|--------------|-------|
| `ResourceA` | **Owns** | Creates and manages lifecycle |
| `ServiceB` | **Borrows** | Passed in, doesn't manage |
| `CacheC` | **Shares** | Shared instance |

## State

**Holds**: [what state this system maintains, or "Stateless"]

**Mutable after creation**: [what can change]

**Immutable**: [what's fixed at creation]

## Invariants

- **Must**: [critical requirement that must always hold]
- **Never**: [thing that must never happen]

## Patterns

```[language]
// Canonical usage
[minimal code example]
```

## Anti-patterns

```[language]
// ❌ Don't - [why]
[bad code]

// ✅ Do instead
[good code]
```
```

---

## Phase 5: Create Symlink

```bash
cd [target] && ln -s AGENTS.md CLAUDE.md
```

---

## Phase 6: Return Summary

Return to coordinator:

```
✅ Captured: [system_name]

Path: [target]/AGENTS.md
Tokens: ~[count]

Dependencies:
  Depends on: [list systems]
  Depended on by: [list systems]

Key Integration Points:
  - [SystemA] ↔ [Contract summary]
  - [SystemB] ↔ [Contract summary]
```

---

## Token Budget

| Target | Maximum |
|--------|---------|
| 800-1500 tokens | 2000 tokens |

### If Over Budget

1. **Compress, don't truncate**
2. Use tables instead of prose
3. Keep: Dependencies, Integration Points, Ownership, Invariants
4. Cut: Obvious patterns, verbose explanations

### Highest Signal (Keep)

- Dependencies (in/out)
- Integration contracts
- Ownership (owns/borrows/shares)
- Initialization & lifecycle
- Invariants (must/never)

### Lower Signal (Cut if needed)

- Obvious type definitions
- Standard patterns
- Things clear from code

---

## Quality Checklist

Before returning:

- [ ] Dependencies section shows what this depends on AND what depends on it
- [ ] Integration points document the contracts
- [ ] Ownership distinguishes owns/borrows/shares
- [ ] Lifecycle is documented
- [ ] Invariants are things code doesn't enforce in types
- [ ] Under 2000 tokens
- [ ] CLAUDE.md symlink created
