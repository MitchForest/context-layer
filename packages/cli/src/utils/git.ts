import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export async function getChangedFiles(): Promise<string[]> {
  try {
    const { stdout } = await execAsync('git diff --name-only HEAD~1 2>/dev/null || git diff --name-only HEAD');
    return stdout.trim().split('\n').filter(f => f.length > 0);
  } catch {
    return [];
  }
}

export async function getChangedFileStats(): Promise<{
  added: string[];
  modified: string[];
  deleted: string[];
}> {
  try {
    const { stdout } = await execAsync('git diff --name-status HEAD~1 2>/dev/null || git diff --name-status HEAD');
    const lines = stdout.trim().split('\n').filter(l => l.length > 0);
    
    const added: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];
    
    for (const line of lines) {
      const [status, file] = line.split('\t');
      switch (status) {
        case 'A':
          added.push(file);
          break;
        case 'M':
          modified.push(file);
          break;
        case 'D':
          deleted.push(file);
          break;
      }
    }
    
    return { added, modified, deleted };
  } catch {
    return { added: [], modified: [], deleted: [] };
  }
}

export async function isGitRepo(): Promise<boolean> {
  try {
    await execAsync('git rev-parse --git-dir');
    return true;
  } catch {
    return false;
  }
}

export async function getGitRoot(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git rev-parse --show-toplevel');
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function installGitHook(): Promise<boolean> {
  const gitRoot = await getGitRoot();
  if (!gitRoot) return false;
  
  const hookPath = path.join(gitRoot, '.git', 'hooks', 'post-commit');
  
  const hookContent = `#!/bin/bash
# Context Layer Auto-Update Hook
# Installed by context-layer init
#
# This hook automatically maintains your context layer:
# - Codemaps: Updated on every commit (free, instant)
# - Curated content: Updated by Haiku when changes detected
#
# To use Opus instead of Haiku, set: export CONTEXT_LAYER_MODEL=opus

set -e

echo "🧠 Context Layer: Processing commit..."

# Step 1: Update codemaps (instant, free)
if command -v context-layer &> /dev/null; then
  context-layer codemap --changed --quiet
  
  # Step 2: Analyze and determine if LLM update needed
  ANALYSIS=$(context-layer analyze --json 2>/dev/null || echo '{"changeType":"none"}')
  CHANGE_TYPE=$(echo "$ANALYSIS" | grep -o '"changeType":"[^"]*"' | cut -d'"' -f4)
  
  # Model selection: default to haiku, allow override via env var
  MODEL=\${CONTEXT_LAYER_MODEL:-haiku}
  
  case $CHANGE_TYPE in
    "none")
      echo "   ✓ Codemaps updated, no curated content changes needed"
      ;;
    "minor"|"major")
      echo "   → Changes detected, updating curated content with $MODEL..."
      if command -v claude &> /dev/null; then
        claude -p "Maintain context layer - update curated content in affected AGENTS.md files based on code changes" --model $MODEL --allowedTools "Read,Write,Bash" 2>/dev/null || echo "   ⚠ Claude maintenance failed"
      else
        echo "   ⚠ Claude CLI not found. Install Claude Code to enable auto-maintenance."
      fi
      ;;
  esac
else
  echo "   ⚠ context-layer CLI not found. Install with: npm install -g context-layer"
fi
`;
  
  try {
    await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
    return true;
  } catch {
    return false;
  }
}

