/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import si from 'systeminformation';

async function runDiagnostics() {
  try {
    const os = await si.osInfo();
    const system = await si.system();
    console.log(`Host: ${os.hostname}`);
    console.log(`OS:   ${os.distro} ${os.release} (${os.arch})`);
    console.log(`Model: ${system.manufacturer} ${system.model}`);
    console.log(`Uptime: ${(si.time().uptime / 3600).toFixed(2)} hours`);

    const cpu = await si.cpu();
    const load = await si.currentLoad();
    console.log(
      `CPU: ${cpu.brand} | ${cpu.physicalCores}/${cpu.cores} Cores | ${cpu.speed} GHz | Load: ${load.currentLoad.toFixed(1)}%`,
    );

    const mem = await si.mem();
    console.log(
      `Mem: ${(mem.active / 1024 / 1024 / 1024).toFixed(2)} GB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
    );

    const fsSize = await si.fsSize();
    fsSize.forEach((disk) => {
      console.log(
        `Disk: ${disk.fs} -> ${(disk.used / 1024 / 1024 / 1024).toFixed(2)} / ${(disk.size / 1024 / 1024 / 1024).toFixed(2)} GB (${disk.use.toFixed(1)}%)`,
      );
    });

    const battery = await si.battery();
    if (battery.hasBattery) {
      console.log(`Bat: ${battery.percent}% | Charging: ${battery.isCharging}`);
    }

    const interfaces = await si.networkInterfaces();
    const defaultIf = await si.networkInterfaceDefault();
    const activeIf = interfaces.find((i) => i.iface === defaultIf);
    if (activeIf) {
      console.log(
        `Net: ${activeIf.iface} | IP: ${activeIf.ip4} | MAC: ${activeIf.mac}`,
      );
    }
  } catch (_e) {
    /* ignore */
  }
}

runDiagnostics();
