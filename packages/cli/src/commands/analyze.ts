import { Command } from 'commander';
import { analyzeChanges, ChangeType } from '../analyzer/changes.js';
import { detectNewSystems } from '../analyzer/systems.js';
import chalk from 'chalk';

interface AnalysisResult {
  changeType: ChangeType;
  newSystems: string[];
  affectedSystems: string[];
  deletedSystems: string[];
  summary: string;
}

export const analyzeCommand = new Command('analyze')
  .description('Analyze code changes and determine what documentation updates are needed')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const changes = await analyzeChanges();
      const newSystems = await detectNewSystems();
      
      const result: AnalysisResult = {
        changeType: changes.type,
        newSystems: newSystems.map(s => s.path),
        affectedSystems: changes.affectedSystems,
        deletedSystems: changes.deletedSystems,
        summary: generateSummary(changes.type, newSystems.length, changes.affectedSystems.length)
      };
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.blue('📊 Change Analysis'));
        console.log('');
        console.log(`   Change Type: ${formatChangeType(result.changeType)}`);
        console.log(`   Affected Systems: ${result.affectedSystems.length}`);
        
        if (result.newSystems.length > 0) {
          console.log(chalk.yellow(`   New Systems Detected: ${result.newSystems.length}`));
          result.newSystems.forEach(s => console.log(chalk.yellow(`      - ${s}`)));
        }
        
        if (result.deletedSystems.length > 0) {
          console.log(chalk.red(`   Deleted Systems: ${result.deletedSystems.length}`));
          result.deletedSystems.forEach(s => console.log(chalk.red(`      - ${s}`)));
        }
        
        console.log('');
        console.log(`   ${result.summary}`);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

function formatChangeType(type: ChangeType): string {
  switch (type) {
    case 'none': return chalk.green('None');
    case 'minor': return chalk.yellow('Minor');
    case 'major': return chalk.red('Major');
  }
}

function generateSummary(type: ChangeType, newSystems: number, affected: number): string {
  if (newSystems > 0) {
    return chalk.yellow(`→ Run 'context-layer build-pending' to document new systems`);
  }
  
  switch (type) {
    case 'none':
      return chalk.green('✓ No documentation updates needed');
    case 'minor':
      return chalk.yellow('→ Haiku will check if curated content needs updates');
    case 'major':
      return chalk.red('→ Opus will review and update documentation');
  }
}

