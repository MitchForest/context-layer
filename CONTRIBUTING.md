# Contributing to Context Layer

Thank you for your interest in contributing to Context Layer!

## Ways to Contribute

### Report Issues

- Found a bug? Open an issue.
- Have a suggestion? Open an issue.
- Something unclear in the docs? Open an issue.

### Improve the Agents

The core agent files are in `agents/`:

- `context-layer-coordinator.md` — Orchestrates discovery, capture, and synthesis
- `context-layer-capture.md` — Deep analysis of individual systems
- `context-layer-maintain.md` — Updates existing nodes after code changes
- `context-layer-synthesis.md` — Deduplicates and organizes hierarchy

Improvements welcome:
- Better prompts for capture workflow
- Clearer instructions
- Edge case handling

### Improve the Skill

The skill file at `skills/context-layer.md` defines how Context Layer is triggered.

### Improve Documentation

- Fix typos
- Clarify confusing sections
- Add examples

## Repository Structure

```
context-layer/
├── agents/                 # Subagent definitions (installed to .claude/agents/)
│   ├── context-layer-coordinator.md
│   ├── context-layer-capture.md
│   ├── context-layer-maintain.md
│   └── context-layer-synthesis.md
├── skills/                 # Skill definition (installed to .claude/skills/)
│   └── context-layer.md
├── install/                # Installation script
│   └── install.sh
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

## Testing

Test your changes using **Claude Code**:

1. Install the skill in a test project (run `install/install.sh` locally)
2. Open Claude Code and run through the commands:
   - "Build context layer for [path]"
   - "Maintain context layer"
   - "Check context layer"
3. Verify the agents follow the instructions correctly
4. Check that resulting AGENTS.md files are properly structured

> **Note**: The subagent architecture requires Claude Code. Cursor support is experimental.

## Pull Request Process

1. Fork the repo
2. Make your changes
3. Test locally
4. Submit a PR with a clear description

## Code of Conduct

Be kind. Be helpful. Keep it professional.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
