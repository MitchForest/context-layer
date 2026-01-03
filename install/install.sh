#!/bin/bash
# Context Layer Installer
# Installs the Context Layer agents and skill into your project
#
# Requires: Claude Code (for building/maintaining the context layer)
# The resulting AGENTS.md files work with any AI tool.

set -e

REPO_URL="https://raw.githubusercontent.com/MitchForest/context-layer/main"

echo "🧠 Installing Context Layer..."
echo ""

# Always install to Claude Code directory
AGENTS_DIR=".claude/agents"
SKILL_DIR=".claude/skills"

echo "📍 Installing for Claude Code"
echo "📁 Agents: $AGENTS_DIR"
echo "📁 Skills: $SKILL_DIR"
echo ""

# Create directories
mkdir -p "$AGENTS_DIR" "$SKILL_DIR" ".context-layer"

# Download agents
echo "📥 Downloading agents..."
curl -sL "$REPO_URL/agents/context-layer-coordinator.md" -o "$AGENTS_DIR/context-layer-coordinator.md"
echo "   ✓ context-layer-coordinator"

curl -sL "$REPO_URL/agents/context-layer-capture.md" -o "$AGENTS_DIR/context-layer-capture.md"
echo "   ✓ context-layer-capture"

curl -sL "$REPO_URL/agents/context-layer-maintain.md" -o "$AGENTS_DIR/context-layer-maintain.md"
echo "   ✓ context-layer-maintain"

curl -sL "$REPO_URL/agents/context-layer-synthesis.md" -o "$AGENTS_DIR/context-layer-synthesis.md"
echo "   ✓ context-layer-synthesis"

# Download skill
echo ""
echo "📥 Downloading skill..."
curl -sL "$REPO_URL/skills/context-layer.md" -o "$SKILL_DIR/context-layer.md"
echo "   ✓ context-layer skill"

# Create .context-layer directory (manifest created by agents on first run)
mkdir -p .context-layer
echo ""
echo "📋 Created .context-layer/ (manifest will be created on first build)"

# Add .context-layer to .gitignore if not already there
if [ -f ".gitignore" ]; then
  if ! grep -q "^\.context-layer" .gitignore; then
    echo ".context-layer/" >> .gitignore
    echo "   ✓ Added .context-layer/ to .gitignore"
  fi
else
  echo ".context-layer/" > .gitignore
  echo "   ✓ Created .gitignore with .context-layer/"
fi

# Create CLAUDE.md symlinks for any existing AGENTS.md files
echo ""
echo "🔗 Creating CLAUDE.md symlinks for existing AGENTS.md files..."
find . -name "AGENTS.md" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./.claude/*" \
  -not -path "./.context-layer/*" \
  2>/dev/null | while read f; do
  dir=$(dirname "$f")
  if [ ! -e "$dir/CLAUDE.md" ]; then
    (cd "$dir" && ln -s AGENTS.md CLAUDE.md)
    echo "   ✓ $dir/CLAUDE.md"
  fi
done

# Install CLI for auto-updating codemaps and git hook
CLI_INSTALLED=false
if command -v npm &> /dev/null; then
  echo ""
  echo "📦 Installing context-layer CLI..."
  if npm install -g context-layer 2>&1 | grep -q "added"; then
    CLI_INSTALLED=true
    echo "   ✓ CLI installed globally"
    
    # Initialize (creates manifest, installs git hook)
    if command -v context-layer &> /dev/null; then
      context-layer init --existing 2>/dev/null || true
      echo "   ✓ Git hook installed (auto-maintains on every commit)"
    fi
  else
    echo "   ℹ CLI not installed (run: npm install -g context-layer)"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Context Layer installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Agents installed to $AGENTS_DIR:"
echo "   • context-layer-coordinator (orchestrates everything)"
echo "   • context-layer-capture (deep system analysis)"
echo "   • context-layer-maintain (updates existing nodes)"
echo "   • context-layer-synthesis (deduplication & hierarchy)"
echo ""
echo "Usage (in Claude Code):"
echo ""
echo "   BUILD (from scratch):"
echo "   > Build context layer for src/"
echo ""
echo "   MAINTAIN (update existing):"
echo "   > Maintain context layer"
echo "   > Sync context layer"
echo ""
echo "   CHECK (report only):"
echo "   > Check context layer"
echo ""
echo "The agents will automatically:"
echo "   1. Discover all systems in your codebase"
echo "   2. Capture context for each system"
echo "   3. Deduplicate shared knowledge"
echo "   4. Create hierarchical AGENTS.md files"
echo "   5. Maintain a manifest at .context-layer/manifest.json"
echo ""

if [ "$CLI_INSTALLED" = true ]; then
  echo "CLI commands available:"
  echo "   context-layer status    # Show coverage and status"
  echo "   context-layer codemap   # Generate/update codemaps"
  echo "   context-layer analyze   # Analyze changes"
  echo ""
  echo "🔄 AUTO-MAINTENANCE ENABLED"
  echo "   On every commit, the git hook will:"
  echo "   1. Update codemaps (instant, free)"
  echo "   2. Run Haiku to update curated content (if changes detected)"
  echo ""
  echo "   To use Opus instead: export CONTEXT_LAYER_MODEL=opus"
  echo ""
fi

echo "Once built, the AGENTS.md files work with any AI tool. ✨"
echo ""
