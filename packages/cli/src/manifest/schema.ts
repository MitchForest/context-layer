export interface Manifest {
  version: '1.0';
  repo: string;
  
  // Timestamps
  created: string;
  lastFullBuild: string | null;
  lastSynthesis: string | null;
  
  // Coverage
  coverage: {
    totalDirectories: number;
    documentedSystems: number;
    percentage: number;
  };
  
  // All documented systems
  systems: {
    [path: string]: SystemEntry;
  };
  
  // Systems waiting to be documented
  pending: PendingSystem[];
  
  // Parent-child relationships
  hierarchy: {
    [parentPath: string]: string[];
  };
  
  // Synthesis tracking
  synthesis: {
    lastRun: string | null;
    factsDeduped: number;
    parentNodesCreated: number;
  };
}

export interface SystemEntry {
  agentsMdPath: string;
  status: 'active' | 'stale' | 'pending_deletion';
  fileCount: number;
  codemapUpdated: string | null;
  curatorUpdated: string | null;
  tokens: number;
}

export interface PendingSystem {
  path: string;
  detectedAt: string;
  reason: string;
  score: number;
}

export function createEmptyManifest(repo: string): Manifest {
  return {
    version: '1.0',
    repo,
    created: new Date().toISOString(),
    lastFullBuild: null,
    lastSynthesis: null,
    coverage: {
      totalDirectories: 0,
      documentedSystems: 0,
      percentage: 0
    },
    systems: {},
    pending: [],
    hierarchy: {},
    synthesis: {
      lastRun: null,
      factsDeduped: 0,
      parentNodesCreated: 0
    }
  };
}

