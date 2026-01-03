import { getChangedFiles, getChangedFileStats } from '../utils/git.js';
import * as path from 'path';

export type ChangeType = 'none' | 'minor' | 'major';

export interface ChangeAnalysis {
  type: ChangeType;
  affectedSystems: string[];
  deletedSystems: string[];
  changedFiles: number;
  addedFiles: number;
  deletedFiles: number;
}

export async function analyzeChanges(): Promise<ChangeAnalysis> {
  const stats = await getChangedFileStats();
  const changedFiles = await getChangedFiles();
  
  // Find affected systems (directories with AGENTS.md)
  const affectedDirs = new Set<string>();
  const deletedSystems: string[] = [];
  
  for (const file of changedFiles) {
    // Walk up to find AGENTS.md
    let dir = path.dirname(file);
    while (dir !== '.' && dir !== '/') {
      affectedDirs.add(dir);
      dir = path.dirname(dir);
    }
    
    // Check if an AGENTS.md was deleted
    if (file.endsWith('AGENTS.md') && stats.deleted.includes(file)) {
      deletedSystems.push(path.dirname(file));
    }
  }
  
  // Determine change type
  let type: ChangeType = 'none';
  
  if (changedFiles.length === 0) {
    type = 'none';
  } else if (
    stats.added.length > 5 ||
    stats.deleted.length > 5 ||
    changedFiles.length > 15 ||
    deletedSystems.length > 0
  ) {
    type = 'major';
  } else if (changedFiles.length > 0) {
    type = 'minor';
  }
  
  return {
    type,
    affectedSystems: Array.from(affectedDirs),
    deletedSystems,
    changedFiles: changedFiles.length,
    addedFiles: stats.added.length,
    deletedFiles: stats.deleted.length
  };
}

