#!/usr/bin/env node
import { Command } from 'commander';
import { codemapCommand } from './commands/codemap.js';
import { analyzeCommand } from './commands/analyze.js';
import { statusCommand } from './commands/status.js';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('context-layer')
  .description('Self-updating documentation for codebases')
  .version('0.1.0');

program.addCommand(codemapCommand);
program.addCommand(analyzeCommand);
program.addCommand(statusCommand);
program.addCommand(initCommand);

program.parse();

