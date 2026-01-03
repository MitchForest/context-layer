import * as fs from 'fs/promises';
import { Manifest, createEmptyManifest } from './schema.js';
import { findProjectRoot } from './read.js';

const MANIFEST_PATH = '.context-layer/manifest.json';

export async function createManifest(): Promise<Manifest> {
  const projectRoot = await findProjectRoot();
  const manifest = createEmptyManifest(projectRoot);
  
  await saveManifest(manifest);
  return manifest;
}

export async function saveManifest(manifest: Manifest): Promise<void> {
  manifest.coverage.percentage = manifest.coverage.totalDirectories > 0
    ? Math.round((manifest.coverage.documentedSystems / manifest.coverage.totalDirectories) * 100)
    : 0;
  
  await fs.mkdir('.context-layer', { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

export async function updateManifest(
  updates: Partial<Pick<Manifest, 'lastFullBuild' | 'lastSynthesis'>> & {
    addSystem?: { path: string; agentsMdPath: string; fileCount: number };
    removeSystem?: string;
    addPending?: { path: string; reason: string; score: number };
    removePending?: string;
  }
): Promise<Manifest> {
  const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(content) as Manifest;
  
  if (updates.lastFullBuild) {
    manifest.lastFullBuild = updates.lastFullBuild;
  }
  
  if (updates.lastSynthesis) {
    manifest.lastSynthesis = updates.lastSynthesis;
  }
  
  if (updates.addSystem) {
    const { path, agentsMdPath, fileCount } = updates.addSystem;
    manifest.systems[path] = {
      agentsMdPath,
      status: 'active',
      fileCount,
      codemapUpdated: new Date().toISOString(),
      curatorUpdated: new Date().toISOString(),
      tokens: 0
    };
    manifest.coverage.documentedSystems = Object.keys(manifest.systems).length;
  }
  
  if (updates.removeSystem) {
    delete manifest.systems[updates.removeSystem];
    manifest.coverage.documentedSystems = Object.keys(manifest.systems).length;
  }
  
  if (updates.addPending) {
    const { path, reason, score } = updates.addPending;
    // Don't add if already pending
    if (!manifest.pending.some(p => p.path === path)) {
      manifest.pending.push({
        path,
        detectedAt: new Date().toISOString(),
        reason,
        score
      });
    }
  }
  
  if (updates.removePending) {
    manifest.pending = manifest.pending.filter(p => p.path !== updates.removePending);
  }
  
  await saveManifest(manifest);
  return manifest;
}

