/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import si from 'systeminformation';

async function runDiagnostics() {
  console.log('=== GEMINI ADVANCED DIAGNOSTICS ===');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // 1. System & OS
    const os = await si.osInfo();
    const system = await si.system();
    console.log(`[System]`);
    console.log(`  Host: ${os.hostname}`);
    console.log(`  OS:   ${os.distro} ${os.release} (${os.arch})`);
    console.log(`  Model: ${system.manufacturer} ${system.model}`);
    console.log(`  Uptime: ${(si.time().uptime / 3600).toFixed(2)} hours`);

    // 2. CPU
    const cpu = await si.cpu();
    const load = await si.currentLoad();
    console.log(`\n[CPU]`);
    console.log(`  Model: ${cpu.brand}`);
    console.log(
      `  Cores: ${cpu.physicalCores} Physical / ${cpu.cores} Logical`,
    );
    console.log(`  Speed: ${cpu.speed} GHz`);
    console.log(`  Load:  ${load.currentLoad.toFixed(1)}%`);

    // 3. Memory
    const mem = await si.mem();
    console.log(`\n[Memory]`);
    console.log(`  Total: ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`  Used:  ${(mem.active / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(
      `  Free:  ${(mem.available / 1024 / 1024 / 1024).toFixed(2)} GB`,
    );

    // 4. Disk / Storage
    const fsSize = await si.fsSize();
    console.log(`\n[Storage]`);
    fsSize.forEach((disk) => {
      const usedPercent = disk.use.toFixed(1);
      const totalGB = (disk.size / 1024 / 1024 / 1024).toFixed(2);
      const usedGB = (disk.used / 1024 / 1024 / 1024).toFixed(2);
      console.log(
        `  ${disk.fs} (${disk.type}) -> ${usedGB} GB / ${totalGB} GB (${usedPercent}%)`,
      );
    });

    // 5. Battery (if applicable)
    const battery = await si.battery();
    if (battery.hasBattery) {
      console.log(`\n[Battery]`);
      console.log(`  Percent: ${battery.percent}%`);
      console.log(`  Charging: ${battery.isCharging}`);
    }

    // 6. Network
    const interfaces = await si.networkInterfaces();
    const defaultIf = await si.networkInterfaceDefault();
    const activeIf = interfaces.find((i) => i.iface === defaultIf);
    console.log(`\n[Network]`);
    if (activeIf) {
      console.log(`  Interface: ${activeIf.iface}`);
      console.log(`  IP (v4):   ${activeIf.ip4}`);
      console.log(`  MAC:       ${activeIf.mac}`);
    } else {
      console.log(`  Status:    Unknown/Offline`);
    }
  } catch (e) {
    console.error('Error retrieving system info:', e);
  }
  console.log('\n===================================\n');
}

runDiagnostics();
