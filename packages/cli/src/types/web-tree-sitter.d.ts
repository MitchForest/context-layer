declare module 'web-tree-sitter' {
  export interface SyntaxNode {
    type: string;
    text: string;
    children: SyntaxNode[];
    parent: SyntaxNode | null;
    childForFieldName(name: string): SyntaxNode | null;
  }

  export interface Tree {
    rootNode: SyntaxNode;
  }

  export class Language {
    static load(path: string): Promise<Language>;
  }

  export class Parser {
    static init(): Promise<void>;
    setLanguage(language: Language): void;
    parse(input: string): Tree | null;
  }
}
