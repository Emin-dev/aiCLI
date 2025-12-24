/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';

const MEMORY_FILE = path.join(process.cwd(), 'GEMINI.md');

function analyze() {
  if (!fs.existsSync(MEMORY_FILE)) return;

  const content = fs.readFileSync(MEMORY_FILE, 'utf-8');
  const totalTasks =
    (content.match(/- \[ \]/g) || []).length +
    (content.match(/- \[x\]/g) || []).length;
  const completedTasks = (content.match(/- \[x\]/g) || []).length;

  if (totalTasks === 0) return;

  const score = Math.round((completedTasks / totalTasks) * 100);
  const status =
    score >= 80 ? 'EXCELLENT' : score >= 50 ? 'GOOD' : 'NEEDS IMPROVEMENT';

  console.log(`[Self-Analysis] Performance Review:`);
  console.log(`- Total Tasks: ${totalTasks}`);
  console.log(`- Completed:   ${completedTasks}`);
  console.log(`- Pending:     ${totalTasks - completedTasks}`);
  console.log(`- Success Rate: ${score}% (${status})`);

  // Suggest focus if score is low
  if (score < 100) {
    console.log(
      `[Self-Analysis] Recommendation: Focus on pending "High Priority" items.`,
    );
  }
}

analyze();
