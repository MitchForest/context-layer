import { Command } from 'commander';
import { generateCodemap } from '../codemap/generator.js';

export const codemapCommand = new Command('codemap')
  .description('Generate codemap (API surface) for a directory')
  .argument('[path]', 'Path to generate codemap for', '.')
  .action(async (targetPath: string) => {
    try {
      console.log(`Generating codemap for ${targetPath}...\n`);
      const codemap = await generateCodemap(targetPath);
      console.log(codemap);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
