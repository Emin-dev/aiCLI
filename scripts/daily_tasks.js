/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('Starting Gemini Daily Tasks...');

const tasks = [
  { name: 'Memory Sync', command: 'node scripts/backup_memory.js' },
  { name: 'Memory Ingestion', command: 'node scripts/ingest_memory.js' },
  { name: 'Performance Review', command: 'node scripts/review_performance.js' },
  { name: 'Cloud Sync', command: 'node scripts/sync_from_cloud.js' },
];

for (const task of tasks) {
  try {
    console.log(`Running ${task.name}...`);
    execSync(task.command, { cwd: projectRoot, stdio: 'inherit' });
    console.log(`${task.name} completed.`);
  } catch (error) {
    console.error(`Error running ${task.name}:`, error.message);
    // Continue with other tasks even if one fails
  }
}

console.log('Daily tasks completed.');
