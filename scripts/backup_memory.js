/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { simpleGit } from 'simple-git';

// Define paths
const PROJECT_ROOT = process.cwd();
const GLOBAL_GEMINI_DIR = path.join(os.homedir(), '.gemini');
const PROJECT_MEMORY = path.join(PROJECT_ROOT, 'GEMINI.md');
const GLOBAL_MEMORY = path.join(GLOBAL_GEMINI_DIR, 'GEMINI.md');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');

// Common Google Drive paths on Windows
const DRIVE_PATHS = [
  path.join(os.homedir(), 'Google Drive'),
  path.join(os.homedir(), 'Drive'),
  'G:\\My Drive',
  'G:\\',
];

async function backup() {
  console.log('[Backup] Starting autonomous backup sequence...');

  // 1. Identify Source of Truth
  let sourceMemory = null;
  if (fs.existsSync(PROJECT_MEMORY)) {
    sourceMemory = PROJECT_MEMORY;
  } else if (fs.existsSync(GLOBAL_MEMORY)) {
    sourceMemory = GLOBAL_MEMORY;
    fs.copyFileSync(GLOBAL_MEMORY, PROJECT_MEMORY);
  }

  if (!sourceMemory) {
    console.warn('[Backup] Critical: No memory (GEMINI.md) found.');
    return;
  }

  // 2. Ensure Backup Directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // 3. Local Timestamped Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `GEMINI_backup_${timestamp}.md`);
  fs.copyFileSync(sourceMemory, backupFile);

  // 4. Update 'Latest' & Global Sync
  const latestFile = path.join(BACKUP_DIR, 'GEMINI_latest.md');
  fs.copyFileSync(sourceMemory, latestFile);

  if (!fs.existsSync(GLOBAL_GEMINI_DIR)) {
    fs.mkdirSync(GLOBAL_GEMINI_DIR, { recursive: true });
  }
  fs.copyFileSync(sourceMemory, GLOBAL_MEMORY);

  // 5. ML Model Data Preparation
  const memoryContent = fs.readFileSync(sourceMemory, 'utf-8');
  const trainData = {
    instruction: 'Act as an autonomous system administrator named Gemini.',
    output: memoryContent,
    timestamp: new Date().toISOString(),
  };
  const mlBackupPath = path.join(BACKUP_DIR, 'gemini_finetune_data.jsonl');
  fs.appendFileSync(mlBackupPath, JSON.stringify(trainData) + '\n');

  // 6. External Drive Backup
  for (const drivePath of DRIVE_PATHS) {
    if (fs.existsSync(drivePath)) {
      const driveBackupDir = path.join(drivePath, 'Gemini_Backups');
      if (!fs.existsSync(driveBackupDir)) {
        try {
          fs.mkdirSync(driveBackupDir);
        } catch (_e) {
          continue;
        }
      }
      try {
        fs.copyFileSync(
          sourceMemory,
          path.join(driveBackupDir, `GEMINI_backup_${timestamp}.md`),
        );
        break;
      } catch (_e) {
        /* ignore */
      }
    }
  }

  // 7. Git Sync & Push
  try {
    const git = simpleGit(PROJECT_ROOT);
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      await git.add('.');
      const status = await git.status();
      if (status.staged.length > 0) {
        console.log('[Backup] Committing and pushing to GitHub...');
        await git.commit(`chore(memory): auto-backup ${timestamp}`);
        await git.push();
        console.log('[Backup] Cloud sync complete.');
      }
    }
  } catch (err) {
    console.warn('[Backup] Git sync failed:', err.message);
  }
}

backup().catch(console.error);
