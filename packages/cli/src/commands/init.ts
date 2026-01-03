import { Command } from 'commander';
import { createManifest } from '../manifest/write.js';
import { installGitHook } from '../utils/git.js';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';

export const initCommand = new Command('init')
  .description('Initialize context layer for this repository')
  .option('--no-hook', 'Skip git hook installation')
  .option('--existing', 'Preserve existing AGENTS.md files')
  .action(async (options: { hook?: boolean; existing?: boolean }) => {
    try {
      console.log(chalk.blue('🧠 Initializing Context Layer...'));
      console.log('');
      
      // Check if already initialized
      const manifestPath = '.context-layer/manifest.json';
      try {
        await fs.access(manifestPath);
        console.log(chalk.yellow('Context layer already initialized.'));
        console.log(chalk.gray(`   Manifest: ${manifestPath}`));
        return;
      } catch {
        // Not initialized, continue
      }
      
      // Create .context-layer directory
      await fs.mkdir('.context-layer', { recursive: true });
      console.log(chalk.green('   ✓ Created .context-layer/'));
      
      // Create initial manifest
      await createManifest();
      console.log(chalk.green('   ✓ Created manifest.json'));
      
      // Add to .gitignore
      const gitignorePath = '.gitignore';
      try {
        let gitignore = '';
        try {
          gitignore = await fs.readFile(gitignorePath, 'utf-8');
        } catch {
          // No .gitignore, will create
        }
        
        if (!gitignore.includes('.context-layer')) {
          gitignore += '\n# Context Layer\n.context-layer/\n';
          await fs.writeFile(gitignorePath, gitignore);
          console.log(chalk.green('   ✓ Added .context-layer/ to .gitignore'));
        }
      } catch (error) {
        console.log(chalk.yellow('   ⚠ Could not update .gitignore'));
      }
      
      // Install git hook
      if (options.hook !== false) {
        const hookInstalled = await installGitHook();
        if (hookInstalled) {
          console.log(chalk.green('   ✓ Installed git hook'));
        } else {
          console.log(chalk.yellow('   ⚠ Could not install git hook (not a git repo?)'));
        }
      }
      
      // Find existing AGENTS.md files
      if (options.existing) {
        console.log(chalk.blue('\n   Scanning for existing AGENTS.md files...'));
        // TODO: Scan and register existing files in manifest
      }
      
      console.log('');
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.green('✅ Context Layer initialized!'));
      console.log(chalk.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log('');
      console.log('Next steps:');
      console.log('');
      console.log('   1. Build your first context layer:');
      console.log(chalk.cyan('      claude -p "Build context layer for src/"'));
      console.log('');
      console.log('   2. Or generate codemaps only:');
      console.log(chalk.cyan('      context-layer codemap src/'));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

