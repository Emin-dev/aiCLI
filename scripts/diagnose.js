/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import os from 'node:os';
import { execSync } from 'node:child_process';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) +
    ' ' +
    ['B', 'KB', 'MB', 'GB', 'TB'][i]
  );
}

function getSystemHealth() {
  console.log('=== GEMINI SYSTEM DIAGNOSTICS ===');
  console.log(`
[System] OS: ${os.type()} | Uptime: ${(os.uptime() / 3600).toFixed(2)} hours`);

  const totalMem = os.totalmem();
  const usedMem = totalMem - os.freemem();
  console.log(
    `[Memory] Used: ${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${((usedMem / totalMem) * 100).toFixed(1)}%)`,
  );

  console.log(
    `[CPU] Model: ${os.cpus()[0].model} | Cores: ${os.cpus().length}`,
  );

  console.log(`
[Storage]`);
  try {
    const psCommand =
      "Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name='Used';Expression={$_.Used}}, @{Name='Total';Expression={$_.Used + $_.Free}} | ConvertTo-Json";
    const output = execSync(`powershell -NoProfile -Command "${psCommand}"`, {
      encoding: 'utf8',
    });
    const drives = JSON.parse(output);
    const driveList = Array.isArray(drives) ? drives : [drives];
    driveList.forEach((d) => {
      if (d.Total > 0) {
        console.log(
          `${d.Name}: ${formatBytes(d.Used)} / ${formatBytes(d.Total)} (${((d.Used / d.Total) * 100).toFixed(1)}%)`,
        );
      }
    });
  } catch (_e) {
    console.log('Disk info unavailable.');
  }

  try {
    execSync('ping -n 1 8.8.8.8', { stdio: 'ignore' });
    console.log('\n[Network] Status: Online');
  } catch {
    console.log('\n[Network] Status: Offline');
  }
  console.log('\n=================================');
}

getSystemHealth();
