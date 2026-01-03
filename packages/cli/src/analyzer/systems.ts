import * as fs from 'fs/promises';
import * as path from 'path';
import { isSystemCandidate, SystemCandidate } from './heuristics.js';
import { getChangedFiles } from '../utils/git.js';

export async function detectNewSystems(): Promise<SystemCandidate[]> {
  const changedFiles = await getChangedFiles();
  const candidates: SystemCandidate[] = [];
  const checkedDirs = new Set<string>();
  
  for (const file of changedFiles) {
    let dir = path.dirname(file);
    
    // Walk up the directory tree
    while (dir !== '.' && dir !== '/' && !checkedDirs.has(dir)) {
      checkedDirs.add(dir);
      
      // Check if this directory already has AGENTS.md
      try {
        await fs.access(path.join(dir, 'AGENTS.md'));
        // Already has AGENTS.md, skip
        break;
      } catch {
        // No AGENTS.md, check if it's a system candidate
        const candidate = await isSystemCandidate(dir);
        if (candidate) {
          candidates.push(candidate);
        }
      }
      
      dir = path.dirname(dir);
    }
  }
  
  // Dedupe - only keep the most specific (deepest) candidates
  const dedupedCandidates: SystemCandidate[] = [];
  for (const candidate of candidates) {
    const isParentOfAnother = candidates.some(
      c => c.path !== candidate.path && c.path.startsWith(candidate.path + '/')
    );
    if (!isParentOfAnother) {
      dedupedCandidates.push(candidate);
    }
  }
  
  return dedupedCandidates.sort((a, b) => b.score - a.score);
}

export async function findAllSystems(rootPath: string = '.'): Promise<SystemCandidate[]> {
  const candidates: SystemCandidate[] = [];
  
  async function walk(dir: string, depth: number = 0) {
    if (depth > 5) return; // Max depth
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      // Skip common non-system directories
      const skipDirs = ['node_modules', '.git', '.context-layer', '.claude', 'dist', 'build', '__pycache__'];
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (skipDirs.includes(entry.name)) continue;
        if (entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        const candidate = await isSystemCandidate(fullPath);
        if (candidate) {
          candidates.push(candidate);
        }
        
        // Continue walking even if this is a candidate (may have child systems)
        await walk(fullPath, depth + 1);
      }
    } catch {
      // Directory not readable
    }
  }
  
  await walk(rootPath);
  return candidates.sort((a, b) => b.score - a.score);
}

