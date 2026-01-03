#!/usr/bin/env node
/**
 * Downloads tree-sitter WASM files for supported languages.
 * Run automatically via postinstall or manually via: node scripts/download-wasm.js
 */

import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wasmDir = join(__dirname, '..', 'wasm');

// WASM files from various sources
// These are pre-built WASM files that work with web-tree-sitter
const WASM_FILES = {
  // From tree-sitter playground / emscripten builds
  'tree-sitter-typescript.wasm': 'https://cdn.jsdelivr.net/npm/tree-sitter-typescript@0.23.2/tree-sitter-typescript.wasm',
  'tree-sitter-tsx.wasm': 'https://cdn.jsdelivr.net/npm/tree-sitter-typescript@0.23.2/tree-sitter-tsx.wasm',
  'tree-sitter-python.wasm': 'https://cdn.jsdelivr.net/npm/tree-sitter-python@0.23.6/tree-sitter-python.wasm',
  'tree-sitter-swift.wasm': 'https://github.com/alex-pinkus/tree-sitter-swift/releases/download/0.7.1-pypi/tree-sitter-swift.wasm',
};

async function download(url, filename) {
  console.log(`  Downloading ${filename}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  ⚠ Could not download ${filename} (${response.status})`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    await writeFile(join(wasmDir, filename), Buffer.from(buffer));
    console.log(`  ✓ ${filename}`);
    return true;
  } catch (error) {
    console.log(`  ⚠ Could not download ${filename}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('📦 Downloading tree-sitter WASM files...\n');
  
  await mkdir(wasmDir, { recursive: true });
  
  let downloaded = 0;
  for (const [filename, url] of Object.entries(WASM_FILES)) {
    if (await download(url, filename)) {
      downloaded++;
    }
  }
  
  console.log(`\n✅ Downloaded ${downloaded}/${Object.keys(WASM_FILES).length} WASM files`);
  
  if (downloaded === 0) {
    console.log('\n⚠ No WASM files downloaded. Codemap generation will be limited.');
  }
}

main().catch(console.error);

