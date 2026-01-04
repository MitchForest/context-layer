#!/bin/bash
# Context Layer Installer
# Installs the Context Layer agents and skill into your project
#
# Requires: Claude Code (for building/maintaining the context layer)
# The resulting AGENTS.md files work with any AI tool.

set -e

REPO_URL="https://raw.githubusercontent.com/MitchForest/context-layer/main"
VERSION="0.2.0"

# Always install to Claude Code directory
AGENTS_DIR=".claude/agents"
SKILL_DIR=".claude/skills"

# Detect if this is an update
if [ -f "$AGENTS_DIR/context-layer-coordinator.md" ]; then
  echo "🔄 Updating Context Layer to v$VERSION..."
  IS_UPDATE=true
else
  echo "🧠 Installing Context Layer v$VERSION..."
  IS_UPDATE=false
fi
echo ""

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

curl -sL "$REPO_URL/agents/context-layer-synthesis.md" -o "$AGENTS_DIR/context-layer-synthesis.md"
echo "   ✓ context-layer-synthesis"

# Download skills
echo ""
echo "📥 Downloading skills..."
curl -sL "$REPO_URL/skills/context-layer.md" -o "$SKILL_DIR/context-layer.md"
echo "   ✓ context-layer (build/update)"

curl -sL "$REPO_URL/skills/add-rule.md" -o "$SKILL_DIR/add-rule.md"
echo "   ✓ add-rule (user-authored rules)"

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

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$IS_UPDATE" = true ]; then
  echo "✅ Context Layer updated to v$VERSION!"
else
  echo "✅ Context Layer v$VERSION installed!"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$IS_UPDATE" = true ]; then
  echo "Agents updated in $AGENTS_DIR"
  echo ""
  echo "Your existing AGENTS.md files are untouched."
  echo "Run 'Build context layer' to use the new agent versions."
else
  echo "Agents installed to $AGENTS_DIR:"
  echo "   • context-layer-coordinator (orchestrates everything)"
  echo "   • context-layer-capture (analyzes systems)"
  echo "   • context-layer-synthesis (deduplication & hierarchy)"
  echo ""
  echo "Usage (in Claude Code):"
  echo ""
  echo "   > Build context layer"
  echo ""
  echo "   The coordinator will:"
  echo "   - Discover systems in your codebase"
  echo "   - Initial build: capture all with Opus"
  echo "   - Updates: use Haiku for minor changes, Opus for major"
  echo "   - Run synthesis to deduplicate"
  echo "   - Create hierarchical AGENTS.md files"
  echo ""
  echo "Once built, the AGENTS.md files work with any AI tool. ✨"
fi
echo ""
echo "To update agents later, re-run:"
echo "   curl -fsSL https://raw.githubusercontent.com/MitchForest/context-layer/main/install/install.sh | bash"
echo ""
