import * as fs from 'fs/promises';
import * as path from 'path';

const CODEMAP_START = '<!-- CODEMAP START - Auto-generated, do not edit -->';
const CODEMAP_END = '<!-- CODEMAP END -->';

/**
 * Find AGENTS.md files that cover the given file path
 */
export async function findAgentsMdFiles(filePath: string): Promise<string[]> {
  const results: string[] = [];
  let dir = path.dirname(filePath);
  
  while (dir !== '.' && dir !== '/') {
    const agentsMdPath = path.join(dir, 'AGENTS.md');
    try {
      await fs.access(agentsMdPath);
      results.push(agentsMdPath);
    } catch {
      // No AGENTS.md in this directory
    }
    dir = path.dirname(dir);
  }
  
  return results;
}

/**
 * Update the codemap section in an AGENTS.md file
 */
export async function updateCodemapSection(agentsMdPath: string, codemap: string): Promise<void> {
  let content: string;
  
  try {
    content = await fs.readFile(agentsMdPath, 'utf-8');
  } catch {
    // File doesn't exist, create with just codemap
    const dirName = path.basename(path.dirname(agentsMdPath));
    content = `# ${dirName}\n\n${codemap}\n\n---\n\n## Ownership\n\n**Owns**: [TODO]\n\n**Does NOT own**: [TODO]\n\n## Invariants\n\n- [TODO]\n`;
    await fs.writeFile(agentsMdPath, content);
    await createSymlink(agentsMdPath);
    return;
  }
  
  // Check if codemap section exists
  const startIdx = content.indexOf(CODEMAP_START);
  const endIdx = content.indexOf(CODEMAP_END);
  
  if (startIdx !== -1 && endIdx !== -1) {
    // Replace existing codemap section
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx + CODEMAP_END.length);
    content = before + codemap + after;
  } else {
    // Insert codemap after the title
    const lines = content.split('\n');
    const titleIdx = lines.findIndex(l => l.startsWith('# '));
    
    if (titleIdx !== -1) {
      // Insert after title and any following blank lines
      let insertIdx = titleIdx + 1;
      while (insertIdx < lines.length && lines[insertIdx].trim() === '') {
        insertIdx++;
      }
      lines.splice(insertIdx, 0, '', codemap, '');
      content = lines.join('\n');
    } else {
      // No title found, prepend
      content = codemap + '\n\n' + content;
    }
  }
  
  await fs.writeFile(agentsMdPath, content);
}

/**
 * Create CLAUDE.md symlink for an AGENTS.md file
 */
async function createSymlink(agentsMdPath: string): Promise<void> {
  const dir = path.dirname(agentsMdPath);
  const claudeMdPath = path.join(dir, 'CLAUDE.md');
  
  try {
    await fs.access(claudeMdPath);
    // Already exists
  } catch {
    try {
      await fs.symlink('AGENTS.md', claudeMdPath);
    } catch {
      // Symlink creation failed, might be Windows
    }
  }
}

/**
 * Count approximate tokens in a string (rough estimate)
 */
export function countTokens(content: string): number {
  // Rough estimate: ~4 characters per token for English text/code
  return Math.ceil(content.length / 4);
}

