import { Command } from 'commander';
import { readManifest } from '../manifest/read.js';
import chalk from 'chalk';

export const statusCommand = new Command('status')
  .description('Show context layer status and coverage')
  .action(async () => {
    try {
      const manifest = await readManifest();
      
      if (!manifest) {
        console.log(chalk.yellow('No context layer found. Run "context-layer init" to get started.'));
        return;
      }
      
      console.log(chalk.blue('📊 Context Layer Status'));
      console.log('');
      
      // Coverage
      const coverage = manifest.coverage;
      const coverageColor = coverage.percentage >= 80 ? chalk.green : 
                           coverage.percentage >= 50 ? chalk.yellow : chalk.red;
      console.log(`   Coverage: ${coverageColor(`${coverage.percentage}%`)} (${coverage.documentedSystems}/${coverage.totalDirectories} systems)`);
      
      // Last updates
      console.log(`   Last Build: ${formatDate(manifest.lastFullBuild)}`);
      console.log(`   Last Synthesis: ${formatDate(manifest.lastSynthesis)}`);
      
      // Systems
      const systems = Object.entries(manifest.systems);
      console.log(`   Documented Systems: ${systems.length}`);
      
      // Pending
      if (manifest.pending.length > 0) {
        console.log(chalk.yellow(`   Pending New Systems: ${manifest.pending.length}`));
        manifest.pending.forEach(p => {
          console.log(chalk.yellow(`      - ${p.path} (${p.reason})`));
        });
      }
      
      // Stale systems
      const stale = systems.filter(([_, s]) => s.status === 'stale');
      if (stale.length > 0) {
        console.log(chalk.yellow(`   Stale Systems: ${stale.length}`));
        stale.forEach(([path]) => {
          console.log(chalk.yellow(`      - ${path}`));
        });
      }
      
      console.log('');
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function formatDate(dateStr: string | null): string {
  if (!dateStr) return chalk.gray('Never');
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return chalk.green('Today');
  if (diffDays === 1) return chalk.green('Yesterday');
  if (diffDays < 7) return chalk.green(`${diffDays} days ago`);
  if (diffDays < 30) return chalk.yellow(`${Math.floor(diffDays / 7)} weeks ago`);
  return chalk.red(`${Math.floor(diffDays / 30)} months ago`);
}

