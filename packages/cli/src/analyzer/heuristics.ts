import * as fs from 'fs/promises';
import * as path from 'path';

export interface SystemCandidate {
  path: string;
  score: number;
  reasons: string[];
  fileCount: number;
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.swift', '.py', '.go', '.rs', '.java'];
const SKIP_PATTERNS = ['test', 'Test', '__tests__', 'spec', '_generated', 'generated', 'mock', 'Mock'];
const ENTRY_POINTS = ['index.ts', 'index.js', 'mod.rs', '__init__.py', 'main.swift', 'main.py'];
const ARCHITECTURAL_PATTERNS = ['Service', 'Manager', 'Engine', 'Controller', 'Provider', 'Repository', 'Store'];

export async function isSystemCandidate(dirPath: string): Promise<SystemCandidate | null> {
  // Skip test/generated directories
  if (SKIP_PATTERNS.some(p => dirPath.includes(p))) {
    return null;
  }
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const sourceFiles = entries.filter(e => 
      e.isFile() && SOURCE_EXTENSIONS.includes(path.extname(e.name))
    );
    
    // Must have minimum files
    if (sourceFiles.length < 3) {
      return null;
    }
    
    const score = 0;
    const reasons: string[] = [];
    let totalScore = 0;
    
    // File count scoring
    if (sourceFiles.length >= 5) {
      totalScore += 2;
      reasons.push('5+ source files');
    } else if (sourceFiles.length >= 3) {
      totalScore += 1;
      reasons.push('3+ source files');
    }
    
    // Entry point
    const hasEntryPoint = sourceFiles.some(f => ENTRY_POINTS.includes(f.name));
    if (hasEntryPoint) {
      totalScore += 3;
      reasons.push('has entry point');
    }
    
    // Architectural pattern in filenames
    const hasArchPattern = sourceFiles.some(f => 
      ARCHITECTURAL_PATTERNS.some(p => f.name.includes(p))
    );
    if (hasArchPattern) {
      totalScore += 2;
      reasons.push('architectural pattern (Service/Manager/etc)');
    }
    
    // Has subdirectories (suggests organization)
    const hasSubdirs = entries.some(e => e.isDirectory() && !e.name.startsWith('.'));
    if (hasSubdirs) {
      totalScore += 1;
      reasons.push('has subdirectories');
    }
    
    // README exists
    const hasReadme = entries.some(e => e.name.toLowerCase() === 'readme.md');
    if (hasReadme) {
      totalScore += 1;
      reasons.push('has README');
    }
    
    // Threshold check
    if (totalScore < 3) {
      return null;
    }
    
    return {
      path: dirPath,
      score: totalScore,
      reasons,
      fileCount: sourceFiles.length
    };
  } catch {
    return null;
  }
}

