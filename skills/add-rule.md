---
name: add-rule
description: Add a rule to an AGENTS.md file. Rules are user-authored constraints that agents should follow. Supports scoping to specific systems.
tools: Read, Write, Glob
model: inherit
---

# Add Rule Skill

Capture rules that agents should follow. These are user-authored (not code-derived) and persist in AGENTS.md files.

## Rule Types

| Prefix | Meaning | Flexibility |
|--------|---------|-------------|
| **Never** | Absolute prohibition | No exceptions |
| **Always** | Must do this | No exceptions |
| **Prefer** | Default approach | Exceptions allowed with justification |
| **Ask first** | Allowed, but get permission | Must confirm before proceeding |
| **Avoid** | Try not to do this | Soft rule, use judgment |

## Activation Phrases

| User Says | Prefix | Scope |
|-----------|--------|-------|
| "Never do X" | **Never** | root |
| "Always do X" | **Always** | root |
| "Prefer X over Y" | **Prefer** | root |
| "Ask before doing X" | **Ask first** | root |
| "Avoid X" | **Avoid** | root |
| "Add rule: X" | Infer from content | root |
| "Remember: X" | Infer from content | root |
| "Add rule for [system]: X" | Infer from content | [system] |
| "Never do X in services" | **Never** | services |

## Workflow

### 1. Parse the Request

Extract:
- **Rule content**: The actual constraint
- **Scope**: Global (root) or specific system

Examples:
```
"Never use any type"
→ Content: "Use `any` type"
→ Prefix: Never
→ Scope: root

"Always get approval before schema changes"
→ Content: "Get user approval before schema changes"
→ Prefix: Always
→ Scope: root

"Add rule for backend: use throwAppError for all errors"
→ Content: "Use `throwAppError()` for all errors"
→ Prefix: Always
→ Scope: backend
```

### 2. Find Target AGENTS.md

```bash
# For root scope
target="AGENTS.md"

# For system scope
target=$(find . -path "*/$system/AGENTS.md" -not -path "*/.claude/*" | head -1)
```

If target doesn't exist:
- For root: Create minimal AGENTS.md
- For system: Report that system doesn't have an AGENTS.md yet

### 3. Add to Rules Section

Look for existing `## Rules` section in the file.

**If section exists:** Append the new rule

**If section doesn't exist:** Add at the end of the file:

```markdown

---

## Rules

<!-- User-authored. Preserved by synthesis. -->

- [new rule here]
```

### 4. Format with Prefix

Apply the appropriate prefix based on user intent:

| User Says | Formatted Rule |
|-----------|----------------|
| "never use any type" | **Never**: Use `any` type |
| "always get approval before schema changes" | **Always**: Get user approval before schema changes |
| "prefer composition over inheritance" | **Prefer**: Composition over inheritance |
| "ask before adding caching" | **Ask first**: Before adding caching layers |
| "try to avoid shared mutable state" | **Avoid**: Shared mutable state |
| "remember to use AppLog" | **Always**: Use `AppLog.*` for logging |

### 5. Confirm

```
✅ Added rule to [target]:

   **[Prefix]**: [rule text]

This will be respected by all agents working in [scope].
```

---

## LCA Suggestion

If you notice the same rule exists in multiple sibling AGENTS.md files, suggest elevating:

```
💡 This rule also exists in:
   - services/AGENTS.md
   - core/AGENTS.md

Consider moving to the parent (src/AGENTS.md) so it applies to both.
Would you like me to do that?
```

---

## Rules Section Format

Use prefix markers for clarity:

```markdown
## Rules

<!-- User-authored. Preserved by synthesis. -->

- **Never**: Use `any` type
- **Never**: Add backwards-compatibility shims
- **Always**: Get user approval before schema changes
- **Always**: Use `@Observable` pattern for services
- **Prefer**: Composition over inheritance
- **Ask first**: Before adding caching layers
- **Ask first**: Before creating new abstractions
- **Avoid**: Shared mutable state
```

---

## What NOT to Do

❌ Don't modify other sections of AGENTS.md
❌ Don't remove existing rules
❌ Don't add code-derived facts (that's for capture agents)
❌ Don't duplicate if rule already exists (check first)
❌ Don't forget the prefix marker

---

## Examples

### Strict Rule (Never)

```
User: "Never use any type"

Action:
1. Open root AGENTS.md
2. Find or create ## Rules section
3. Add: "**Never**: Use `any` type"
4. Confirm
```

### Strict Rule (Always)

```
User: "Always get approval before schema changes"

Action:
1. Open root AGENTS.md
2. Find or create ## Rules section
3. Add: "**Always**: Get user approval before schema changes"
4. Confirm
```

### Flexible Rule (Ask First)

```
User: "Ask before adding caching"

Action:
1. Open root AGENTS.md
2. Find or create ## Rules section
3. Add: "**Ask first**: Before adding caching layers"
4. Confirm
```

### Scoped Rule

```
User: "Always use AppLog for iOS"

Action:
1. Find apps/ios/AGENTS.md
2. Find or create ## Rules section
3. Add: "**Always**: Use `AppLog.*` for logging"
4. Confirm
```

### Preference

```
User: "Prefer composition over inheritance"

Action:
1. Open root AGENTS.md
2. Find or create ## Rules section
3. Add: "**Prefer**: Composition over inheritance"
4. Confirm
```
