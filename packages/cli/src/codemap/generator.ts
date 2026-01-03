import * as fs from 'fs/promises';
import * as path from 'path';
import { initParser, parseTypeScript, parseSwift, parsePython, Signature } from './parser.js';

export { Signature };

export interface FileCodemap {
  path: string;
  language: string;
  signatures: Signature[];
}

export async function generateCodemap(dirPath: string): Promise<string> {
  await initParser();
  
  const files = await getSourceFiles(dirPath);
  const codemaps: FileCodemap[] = [];
  
  for (const file of files) {
    const codemap = await parseFile(file);
    if (codemap && codemap.signatures.length > 0) {
      codemaps.push(codemap);
    }
  }
  
  return formatCodemapMarkdown(codemaps);
}

async function getSourceFiles(dirPath: string): Promise<string[]> {
  const extensions = ['.ts', '.tsx', '.swift', '.py', '.js', '.jsx'];
  const excludePatterns = ['test', 'Test', '__tests__', 'spec', '.d.ts', '_generated', 'node_modules'];
  
  const files: string[] = [];
  
  async function walk(dir: string, depth: number = 0) {
    if (depth > 2) return;
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (excludePatterns.some(p => entry.name.includes(p))) continue;
        
        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Directory doesn't exist or not readable
    }
  }
  
  await walk(dirPath);
  return files.sort();
}

async function parseFile(filePath: string): Promise<FileCodemap | null> {
  const ext = path.extname(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  
  let signatures: Signature[] = [];
  let language = '';
  
  switch (ext) {
    case '.ts':
    case '.js':
      language = 'typescript';
      signatures = await parseTypeScript(content, false);
      break;
    case '.tsx':
    case '.jsx':
      language = 'typescript';
      signatures = await parseTypeScript(content, true);
      break;
    case '.swift':
      language = 'swift';
      signatures = await parseSwift(content);
      break;
    case '.py':
      language = 'python';
      signatures = await parsePython(content);
      break;
    default:
      return null;
  }
  
  return {
    path: filePath,
    language,
    signatures
  };
}

function formatCodemapMarkdown(codemaps: FileCodemap[]): string {
  const lines: string[] = [
    '<!-- CODEMAP START - Auto-generated, do not edit -->',
    '## API Surface',
    ''
  ];
  
  // Group by directory
  const byDir = new Map<string, FileCodemap[]>();
  for (const cm of codemaps) {
    const dir = path.dirname(cm.path);
    if (!byDir.has(dir)) {
      byDir.set(dir, []);
    }
    byDir.get(dir)!.push(cm);
  }
  
  for (const [dir, files] of byDir) {
    for (const file of files) {
      const fileName = path.basename(file.path);
      lines.push(`### ${fileName}`);
      
      for (const sig of file.signatures) {
        if (sig.exported) {
          lines.push(`- \`${sig.signature}\``);
        }
      }
      
      lines.push('');
    }
  }
  
  lines.push('<!-- CODEMAP END -->');
  
  return lines.join('\n');
}
