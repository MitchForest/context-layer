#!/usr/bin/env node
import { Command } from 'commander';
import { codemapCommand } from './commands/codemap.js';

const program = new Command();

program
  .name('context-layer')
  .description('Generate codemaps for AI context')
  .version('0.2.0');

program.addCommand(codemapCommand);

program.parse();
