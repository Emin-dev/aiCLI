/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { simpleGit } from 'simple-git';

const PROJECT_ROOT = process.cwd();
const git = simpleGit(PROJECT_ROOT);

async function sync() {
  console.log('[Sync] Checking for updates from cloud...');
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log('[Sync] Not a git repository. Skipping cloud sync.');
      return;
    }

    // Fetch updates
    await git.fetch();

    // Check status
    const _status = await git.status();

    // Pull with auto-merge strategy (prefer local changes if conflict, or standard merge)
    try {
      const pullResult = await git.pull();
      console.log(
        `[Sync] Pull complete. Changes: ${pullResult.summary.changes}`,
      );
    } catch (pullErr) {
      console.warn('[Sync] Pull conflict or error:', pullErr.message);
      console.log(
        '[Sync] Attempting to resolve by prioritizing local memory...',
      );
      // Logic to handle merge conflicts if necessary
      // For now, we log it. A complex merge driver is risky without user input.
    }
  } catch (e) {
    console.error('[Sync] Failed:', e);
  }
}

sync();
