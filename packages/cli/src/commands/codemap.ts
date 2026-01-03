import { Command } from 'commander';
import { generateCodemap } from '../codemap/generator.js';
import { getChangedFiles } from '../utils/git.js';
import { findAgentsMdFiles, updateCodemapSection } from '../utils/files.js';
import chalk from 'chalk';

export const codemapCommand = new Command('codemap')
  .description('Generate or update codemap sections in AGENTS.md files')
  .argument('[path]', 'Path to generate codemap for', '.')
  .option('--changed', 'Only update codemaps for files changed since last commit')
  .option('--quiet', 'Suppress output')
  .option('--dry-run', 'Show what would be updated without making changes')
  .action(async (path: string, options: { changed?: boolean; quiet?: boolean; dryRun?: boolean }) => {
    try {
      const log = options.quiet ? () => {} : console.log;
      
      if (options.changed) {
        // Get files changed in last commit
        const changedFiles = await getChangedFiles();
        if (changedFiles.length === 0) {
          log(chalk.green('✓ No files changed'));
          return;
        }
        
        // Find unique directories with AGENTS.md
        const dirsToUpdate = new Set<string>();
        for (const file of changedFiles) {
          const agentsMd = await findAgentsMdFiles(file);
          agentsMd.forEach(f => dirsToUpdate.add(f));
        }
        
        if (dirsToUpdate.size === 0) {
          log(chalk.green('✓ No AGENTS.md files affected'));
          return;
        }
        
        log(chalk.blue(`Updating ${dirsToUpdate.size} AGENTS.md file(s)...`));
        
        for (const agentsMdPath of dirsToUpdate) {
          const codemap = await generateCodemap(agentsMdPath.replace('/AGENTS.md', ''));
          
          if (options.dryRun) {
            log(chalk.yellow(`Would update: ${agentsMdPath}`));
          } else {
            await updateCodemapSection(agentsMdPath, codemap);
            log(chalk.green(`   ✓ ${agentsMdPath}`));
          }
        }
      } else {
        // Generate codemap for specified path
        log(chalk.blue(`Generating codemap for ${path}...`));
        
        const codemap = await generateCodemap(path);
        
        if (options.dryRun) {
          console.log('\n' + codemap);
        } else {
          // Find or create AGENTS.md and update codemap section
          const agentsMdPath = `${path}/AGENTS.md`;
          await updateCodemapSection(agentsMdPath, codemap);
          log(chalk.green(`✓ Updated ${agentsMdPath}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

