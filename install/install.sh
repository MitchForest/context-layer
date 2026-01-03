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

# Detect platform
if [ -d ".cursor" ]; then
  echo "📍 Detected: Cursor"
  echo ""
  echo "⚠️  Note: Cursor's .cursor/agents support is experimental."
  echo "   For best results, use Claude Code to build your Context Layer."
  echo "   The resulting AGENTS.md files will work in Cursor."
  echo ""
  AGENTS_DIR=".cursor/agents"
  SKILL_DIR=".cursor/skills"
  PLATFORM="Cursor (experimental)"
elif [ -d ".claude" ] || command -v claude &> /dev/null; then
  AGENTS_DIR=".claude/agents"
  SKILL_DIR=".claude/skills"
  PLATFORM="Claude Code"
else
  # Default to Claude Code structure
  AGENTS_DIR=".claude/agents"
  SKILL_DIR=".claude/skills"
  PLATFORM="Claude Code"
fi

echo "📍 Platform: $PLATFORM"
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

# Create initial manifest if it doesn't exist
if [ ! -f ".context-layer/manifest.json" ]; then
  echo ""
  echo "📋 Creating initial manifest..."
  cat > .context-layer/manifest.json << 'EOF'
{
  "version": "1.0",
  "created": null,
  "updated": null,
  "root": null,
  "systems": [],
  "hierarchy": {},
  "synthesis": {
    "lastRun": null,
    "factsDeduped": 0,
    "nodesCreated": 0,
    "symlinksCreated": 0
  }
}
EOF
  echo "   ✓ .context-layer/manifest.json"
fi

# Create CLAUDE.md symlinks for any existing AGENTS.md files
echo ""
echo "🔗 Creating CLAUDE.md symlinks for existing AGENTS.md files..."
symlink_count=0
find . -name "AGENTS.md" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./.claude/*" \
  -not -path "./.cursor/*" \
  -not -path "./.context-layer/*" \
  2>/dev/null | while read f; do
  dir=$(dirname "$f")
  if [ ! -e "$dir/CLAUDE.md" ]; then
    (cd "$dir" && ln -s AGENTS.md CLAUDE.md)
    echo "   ✓ $dir/CLAUDE.md"
    symlink_count=$((symlink_count + 1))
  fi
done

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
echo "   > Build context layer for apps/ios"
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
echo "Once built, the AGENTS.md files work with any AI tool. ✨"
echo ""
