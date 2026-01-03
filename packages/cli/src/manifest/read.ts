import * as fs from 'fs/promises';
import * as path from 'path';
import { Manifest } from './schema.js';

const MANIFEST_PATH = '.context-layer/manifest.json';

export async function readManifest(): Promise<Manifest | null> {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content) as Manifest;
  } catch {
    return null;
  }
}

export async function findProjectRoot(): Promise<string> {
  // Try to find project root by looking for common markers
  const markers = ['.git', 'package.json', 'Cargo.toml', 'go.mod', 'pyproject.toml'];
  
  let dir = process.cwd();
  
  while (dir !== '/') {
    for (const marker of markers) {
      try {
        await fs.access(path.join(dir, marker));
        return dir;
      } catch {
        // Continue
      }
    }
    dir = path.dirname(dir);
  }
  
  return process.cwd();
}

