import * as fs from 'fs/promises';
import * as path from 'path';

export interface SystemCandidate {
  path: string;
  score: number;
  reasons: string[];
  skipReasons: string[];
  fileCount: number;
  shouldCapture: boolean;
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.swift', '.py', '.go', '.rs', '.java'];

// Directories to always skip
const SKIP_DIRS = [
  'test', 'tests', 'Test', 'Tests', '__tests__',
  'spec', 'specs',
  '_generated', 'generated', 'Generated',
  'mock', 'Mock', 'mocks', 'Mocks',
  'node_modules', '.git',
  'assets', 'Assets', 'Resources',
  'dist', 'build', 'out',
];

// Directories that are presentational, not functional systems
const PRESENTATION_PATTERNS = [
  'Theme', 'theme', 'Themes', 'themes',
  'Components', 'components',
  'Styles', 'styles',
  'Assets', 'assets',
  'Fonts', 'fonts',
  'Images', 'images',
  'Icons', 'icons',
];

// Directories that are just data, not systems
const DATA_ONLY_PATTERNS = [
  'Models', 'models',
  'Types', 'types',
  'DTOs', 'dtos',
  'Entities', 'entities',
];

// High-value architectural directories
const FUNCTIONAL_DIRS = [
  'Services', 'services',
  'Core', 'core',
  'Features', 'features',
  'Modules', 'modules',
  'Domain', 'domain',
  'Application', 'application',
  'API', 'api',
];

// High-value file patterns (suggest business logic)
const ARCHITECTURAL_PATTERNS = [
  'Service', 'Manager', 'Engine', 'Controller',
  'Provider', 'Repository', 'Store', 'Handler',
  'Coordinator', 'Orchestrator', 'Gateway',
  'UseCase', 'Interactor',
];

const ENTRY_POINTS = ['index.ts', 'index.js', 'mod.rs', '__init__.py', 'main.swift', 'main.py'];

export async function isSystemCandidate(dirPath: string): Promise<SystemCandidate | null> {
  const dirName = path.basename(dirPath);
  const skipReasons: string[] = [];
  
  // Always skip certain directories
  if (SKIP_DIRS.some(p => dirPath.includes(`/${p}/`) || dirPath.endsWith(`/${p}`) || dirName === p)) {
    return null;
  }
  
  // Check for presentation-only directories
  const isPresentational = PRESENTATION_PATTERNS.some(p => 
    dirName === p || dirPath.includes(`/${p}/`)
  );
  if (isPresentational) {
    skipReasons.push('presentation-only (Theme/Components)');
  }
  
  // Check for data-only directories  
  const isDataOnly = DATA_ONLY_PATTERNS.some(p =>
    dirName === p || dirPath.includes(`/${p}/`)
  );
  if (isDataOnly) {
    skipReasons.push('data-only (Models/Types)');
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
    
    const reasons: string[] = [];
    let totalScore = 0;
    
    // High-value directory name
    const isFunctionalDir = FUNCTIONAL_DIRS.some(p => dirName === p);
    if (isFunctionalDir) {
      totalScore += 5;
      reasons.push(`functional directory (${dirName})`);
    }
    
    // Architectural pattern in filenames
    const filesWithPattern = sourceFiles.filter(f => 
      ARCHITECTURAL_PATTERNS.some(p => f.name.includes(p))
    );
    if (filesWithPattern.length >= 2) {
      totalScore += 4;
      reasons.push('multiple architectural patterns (Service/Engine/etc)');
    } else if (filesWithPattern.length === 1) {
      totalScore += 2;
      reasons.push('architectural pattern in filename');
    }
    
    // File count scoring
    if (sourceFiles.length >= 8) {
      totalScore += 2;
      reasons.push('8+ source files');
    } else if (sourceFiles.length >= 5) {
      totalScore += 1;
      reasons.push('5+ source files');
    }
    
    // Entry point
    const hasEntryPoint = sourceFiles.some(f => ENTRY_POINTS.includes(f.name));
    if (hasEntryPoint) {
      totalScore += 2;
      reasons.push('has entry point');
    }
    
    // Penalty for presentation/data-only
    if (isPresentational) {
      totalScore -= 5;
    }
    if (isDataOnly) {
      totalScore -= 3;
    }
    
    // Threshold: Need score >= 4 to be worth capturing
    const shouldCapture = totalScore >= 4 && skipReasons.length === 0;
    
    return {
      path: dirPath,
      score: totalScore,
      reasons,
      skipReasons,
      fileCount: sourceFiles.length,
      shouldCapture,
    };
  } catch {
    return null;
  }
}
