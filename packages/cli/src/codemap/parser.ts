import { Parser, Language, SyntaxNode } from 'web-tree-sitter';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Signature {
  name: string;
  kind: 'function' | 'class' | 'interface' | 'type' | 'enum' | 'struct' | 'protocol' | 'variable' | 'trait';
  signature: string;
  exported: boolean;
}

let initialized = false;
let typescriptLanguage: Language | null = null;
let tsxLanguage: Language | null = null;
let swiftLanguage: Language | null = null;
let pythonLanguage: Language | null = null;
let rustLanguage: Language | null = null;
let goLanguage: Language | null = null;

const wasmDir = path.join(__dirname, '..', '..', 'wasm');

export async function initParser(): Promise<void> {
  if (initialized) return;
  
  await Parser.init();
  
  // Load languages that exist
  try {
    typescriptLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-typescript.wasm'));
  } catch { /* Optional */ }
  
  try {
    tsxLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-tsx.wasm'));
  } catch { /* Optional */ }
  
  try {
    swiftLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-swift.wasm'));
  } catch { /* Optional */ }
  
  try {
    pythonLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-python.wasm'));
  } catch { /* Optional */ }
  
  try {
    rustLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-rust.wasm'));
  } catch { /* Optional */ }
  
  try {
    goLanguage = await Language.load(path.join(wasmDir, 'tree-sitter-go.wasm'));
  } catch { /* Optional */ }
  
  initialized = true;
}

export async function parseTypeScript(content: string, isTsx: boolean = false): Promise<Signature[]> {
  const lang = isTsx ? tsxLanguage : typescriptLanguage;
  if (!lang) return [];
  
  const parser = new Parser();
  parser.setLanguage(lang);
  const tree = parser.parse(content);
  if (!tree) return [];
  
  const signatures: Signature[] = [];
  
  function walk(node: SyntaxNode) {
    switch (node.type) {
      case 'export_statement': {
        const declaration = node.childForFieldName('declaration');
        if (declaration) {
          extractFromDeclaration(declaration, true, signatures);
        }
        break;
      }
    }
    
    for (const child of node.children) {
      walk(child);
    }
  }
  
  walk(tree.rootNode);
  return signatures;
}

function extractFromDeclaration(node: SyntaxNode, exported: boolean, signatures: Signature[]): void {
  switch (node.type) {
    case 'function_declaration': {
      const name = node.childForFieldName('name')?.text ?? '';
      const params = node.childForFieldName('parameters')?.text ?? '()';
      const returnType = node.childForFieldName('return_type')?.text ?? '';
      const isAsync = node.children.some(c => c.type === 'async');
      
      let sig = isAsync ? 'async function ' : 'function ';
      sig += `${name}${params}`;
      if (returnType) sig += returnType;
      
      signatures.push({ name, kind: 'function', signature: sig, exported });
      break;
    }
    
    case 'class_declaration': {
      const name = node.childForFieldName('name')?.text ?? '';
      signatures.push({ name, kind: 'class', signature: `class ${name}`, exported });
      break;
    }
    
    case 'interface_declaration': {
      const name = node.childForFieldName('name')?.text ?? '';
      signatures.push({ name, kind: 'interface', signature: `interface ${name}`, exported });
      break;
    }
    
    case 'type_alias_declaration': {
      const name = node.childForFieldName('name')?.text ?? '';
      signatures.push({ name, kind: 'type', signature: `type ${name}`, exported });
      break;
    }
    
    case 'enum_declaration': {
      const name = node.childForFieldName('name')?.text ?? '';
      signatures.push({ name, kind: 'enum', signature: `enum ${name}`, exported });
      break;
    }
    
    case 'lexical_declaration': {
      for (const child of node.children) {
        if (child.type === 'variable_declarator') {
          const name = child.childForFieldName('name')?.text ?? '';
          const value = child.childForFieldName('value');
          const isFunction = value?.type === 'arrow_function' || value?.type === 'function';
          
          signatures.push({
            name,
            kind: isFunction ? 'function' : 'variable',
            signature: `const ${name}`,
            exported
          });
        }
      }
      break;
    }
  }
}

export async function parseSwift(content: string): Promise<Signature[]> {
  if (!swiftLanguage) return [];
  
  const parser = new Parser();
  parser.setLanguage(swiftLanguage);
  const tree = parser.parse(content);
  if (!tree) return [];
  
  const signatures: Signature[] = [];
  
  function walk(node: SyntaxNode) {
    const isPrivate = node.text.includes('private ') || node.text.includes('fileprivate ');
    if (isPrivate) return;
    
    switch (node.type) {
      case 'class_declaration': {
        const nameNode = node.children.find(c => c.type === 'type_identifier');
        if (nameNode) {
          signatures.push({ name: nameNode.text, kind: 'class', signature: `class ${nameNode.text}`, exported: true });
        }
        break;
      }
      
      case 'struct_declaration': {
        const nameNode = node.children.find(c => c.type === 'type_identifier');
        if (nameNode) {
          signatures.push({ name: nameNode.text, kind: 'struct', signature: `struct ${nameNode.text}`, exported: true });
        }
        break;
      }
      
      case 'protocol_declaration': {
        const nameNode = node.children.find(c => c.type === 'type_identifier');
        if (nameNode) {
          signatures.push({ name: nameNode.text, kind: 'protocol', signature: `protocol ${nameNode.text}`, exported: true });
        }
        break;
      }
      
      case 'enum_declaration': {
        const nameNode = node.children.find(c => c.type === 'type_identifier');
        if (nameNode) {
          signatures.push({ name: nameNode.text, kind: 'enum', signature: `enum ${nameNode.text}`, exported: true });
        }
        break;
      }
      
      case 'function_declaration': {
        const nameNode = node.children.find(c => c.type === 'simple_identifier');
        if (nameNode) {
          signatures.push({ name: nameNode.text, kind: 'function', signature: `func ${nameNode.text}()`, exported: true });
        }
        break;
      }
    }
    
    for (const child of node.children) {
      walk(child);
    }
  }
  
  walk(tree.rootNode);
  return signatures;
}

export async function parsePython(content: string): Promise<Signature[]> {
  if (!pythonLanguage) return [];
  
  const parser = new Parser();
  parser.setLanguage(pythonLanguage);
  const tree = parser.parse(content);
  if (!tree) return [];
  
  const signatures: Signature[] = [];
  
  function walk(node: SyntaxNode, depth: number = 0) {
    if (depth > 1) return;
    
    switch (node.type) {
      case 'class_definition': {
        const name = node.childForFieldName('name')?.text ?? '';
        if (!name.startsWith('_')) {
          signatures.push({ name, kind: 'class', signature: `class ${name}`, exported: true });
        }
        break;
      }
      
      case 'function_definition': {
        const name = node.childForFieldName('name')?.text ?? '';
        if (!name.startsWith('_') || name === '__init__') {
          const params = node.childForFieldName('parameters')?.text ?? '()';
          signatures.push({ name, kind: 'function', signature: `def ${name}${params}`, exported: !name.startsWith('_') });
        }
        break;
      }
    }
    
    for (const child of node.children) {
      walk(child, depth + 1);
    }
  }
  
  walk(tree.rootNode, 0);
  return signatures;
}

export async function parseRust(content: string): Promise<Signature[]> {
  if (!rustLanguage) return [];
  
  const parser = new Parser();
  parser.setLanguage(rustLanguage);
  const tree = parser.parse(content);
  if (!tree) return [];
  
  const signatures: Signature[] = [];
  
  function walk(node: SyntaxNode) {
    // Skip private items (no pub keyword)
    const nodeText = node.text;
    const isPublic = nodeText.startsWith('pub ');
    
    switch (node.type) {
      case 'function_item': {
        const name = node.childForFieldName('name')?.text ?? '';
        const params = node.childForFieldName('parameters')?.text ?? '()';
        const returnType = node.childForFieldName('return_type')?.text ?? '';
        
        let sig = isPublic ? 'pub fn ' : 'fn ';
        sig += `${name}${params}`;
        if (returnType) sig += ` ${returnType}`;
        
        signatures.push({ name, kind: 'function', signature: sig, exported: isPublic });
        break;
      }
      
      case 'struct_item': {
        const name = node.childForFieldName('name')?.text ?? '';
        const sig = isPublic ? `pub struct ${name}` : `struct ${name}`;
        signatures.push({ name, kind: 'struct', signature: sig, exported: isPublic });
        break;
      }
      
      case 'enum_item': {
        const name = node.childForFieldName('name')?.text ?? '';
        const sig = isPublic ? `pub enum ${name}` : `enum ${name}`;
        signatures.push({ name, kind: 'enum', signature: sig, exported: isPublic });
        break;
      }
      
      case 'trait_item': {
        const name = node.childForFieldName('name')?.text ?? '';
        const sig = isPublic ? `pub trait ${name}` : `trait ${name}`;
        signatures.push({ name, kind: 'trait', signature: sig, exported: isPublic });
        break;
      }
      
      case 'impl_item': {
        // Skip impl blocks, we just want the types
        return;
      }
    }
    
    for (const child of node.children) {
      walk(child);
    }
  }
  
  walk(tree.rootNode);
  return signatures;
}

export async function parseGo(content: string): Promise<Signature[]> {
  if (!goLanguage) return [];
  
  const parser = new Parser();
  parser.setLanguage(goLanguage);
  const tree = parser.parse(content);
  if (!tree) return [];
  
  const signatures: Signature[] = [];
  
  function walk(node: SyntaxNode) {
    switch (node.type) {
      case 'function_declaration': {
        const name = node.childForFieldName('name')?.text ?? '';
        const params = node.childForFieldName('parameters')?.text ?? '()';
        const result = node.childForFieldName('result')?.text ?? '';
        
        // In Go, exported = starts with uppercase
        const isExported = name.length > 0 && name[0] === name[0].toUpperCase();
        
        let sig = `func ${name}${params}`;
        if (result) sig += ` ${result}`;
        
        signatures.push({ name, kind: 'function', signature: sig, exported: isExported });
        break;
      }
      
      case 'method_declaration': {
        const name = node.childForFieldName('name')?.text ?? '';
        const receiver = node.childForFieldName('receiver')?.text ?? '';
        const params = node.childForFieldName('parameters')?.text ?? '()';
        const result = node.childForFieldName('result')?.text ?? '';
        
        const isExported = name.length > 0 && name[0] === name[0].toUpperCase();
        
        let sig = `func ${receiver} ${name}${params}`;
        if (result) sig += ` ${result}`;
        
        signatures.push({ name, kind: 'function', signature: sig, exported: isExported });
        break;
      }
      
      case 'type_declaration': {
        for (const spec of node.children) {
          if (spec.type === 'type_spec') {
            const name = spec.childForFieldName('name')?.text ?? '';
            const typeNode = spec.childForFieldName('type');
            const isExported = name.length > 0 && name[0] === name[0].toUpperCase();
            
            if (typeNode?.type === 'struct_type') {
              signatures.push({ name, kind: 'struct', signature: `type ${name} struct`, exported: isExported });
            } else if (typeNode?.type === 'interface_type') {
              signatures.push({ name, kind: 'interface', signature: `type ${name} interface`, exported: isExported });
            } else {
              signatures.push({ name, kind: 'type', signature: `type ${name}`, exported: isExported });
            }
          }
        }
        break;
      }
    }
    
    for (const child of node.children) {
      walk(child);
    }
  }
  
  walk(tree.rootNode);
  return signatures;
}

