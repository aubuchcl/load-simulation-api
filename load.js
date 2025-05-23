function burnCPU(cpu) {
  const fullCores = Math.floor(cpu);
  const fractionalCore = cpu % 1;
  const workers = [];

  // Full-core workers (100% utilization)
  for (let i = 0; i < fullCores; i++) {
    let active = true;

    const worker = async () => {
      while (active) {
        const start = Date.now();
        while (Date.now() - start < 100) {
          Math.sqrt(Math.random());
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    };

    worker.stop = () => { active = false; };
    worker();
    workers.push(worker);
  }

  // Fractional core worker (e.g. 25%, 50%, 75%)
  if (fractionalCore > 0) {
    let active = true;

    const worker = async () => {
      while (active) {
        const busyTime = fractionalCore * 10; // 10ms cycle
        const idleTime = 10 - busyTime;

        const start = Date.now();
        while (Date.now() - start < busyTime) {
          Math.sqrt(Math.random());
        }

        await new Promise((resolve) => setTimeout(resolve, idleTime));
      }
    };

    worker.stop = () => { active = false; };
    worker();
    workers.push(worker);
  }

  return () => workers.forEach((w) => w.stop());
}

function consumeRAM(mb) {
  const buffers = [];
  for (let i = 0; i < mb; i++) {
    const buf = Buffer.alloc(1024 * 1024); // 1 MiB
    for (let j = 0; j < buf.length; j += 4096) {
      buf[j] = 0xff; // touch every 4KB page
    }
    buffers.push(buf);
  }
  return buffers;
}

function simulateLoad({ cpu, ram, duration }) {
  const stopCPU = cpu > 0 ? burnCPU(cpu) : () => {};
  const buffers = ram > 0 ? consumeRAM(ram) : [];

  setTimeout(() => {
    stopCPU();
    buffers.length = 0; // drop refs

    if (global.gc) {
      console.log("Forcing garbage collection...");
      global.gc();
    } else {
      console.warn("GC not available — run Node with --expose-gc");
    }

    console.log(`Load spike ended after ${duration}s.`);
  }, duration * 1000);
}

module.exports = { simulateLoad };
