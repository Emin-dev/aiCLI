/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const MEMORY_FILE = path.join(process.cwd(), 'GEMINI.md');

function analyze() {
  if (!fs.existsSync(MEMORY_FILE)) return;

  const content = fs.readFileSync(MEMORY_FILE, 'utf-8');
  const totalTasks =
    (content.match(/- \[ \]/g) || []).length +
    (content.match(/- \[x\]/g) || []).length;
  const completedTasks = (content.match(/- \[x\]/g) || []).length;
  const pendingTasks = totalTasks - completedTasks;

  if (totalTasks === 0) return;

  const score = Math.round((completedTasks / totalTasks) * 100);
  const status =
    score >= 80 ? 'EXCELLENT' : score >= 50 ? 'GOOD' : 'NEEDS IMPROVEMENT';

  console.log(`[Self-Analysis] Performance Review:`);
  console.log(`- Total Tasks: ${totalTasks}`);
  console.log(`- Completed:   ${completedTasks}`);
  console.log(`- Pending:     ${pendingTasks}`);
  console.log(`- Success Rate: ${score}% (${status})`);

  // Suggest focus if score is low
  if (score < 100) {
    console.log(
      `[Self-Analysis] Recommendation: Focus on pending "High Priority" items.`,
    );
  }

  // Self-Correction Loop
  if (pendingTasks > 0 && process.env.GEMINI_AUTO_FIX !== 'false') {
    console.log(
      '[Self-Analysis] Triggering automated fix loop (running daily tasks)...',
    );
    // Prevent infinite recursion by checking an env var or just relying on daily_tasks idempotency.
    // For now, we simply log the suggestion, or if running in a daemon, we could spawn.
    // We will spawn it detached to avoid holding up this process.
    const child = spawn('node', ['scripts/daily_tasks.js'], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  }
}

analyze();
