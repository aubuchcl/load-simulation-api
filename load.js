// load.js

function burnCPU(cpu) {
  const fullCores = Math.floor(cpu);
  const fractionalCore = cpu % 1;
  const workers = [];

  console.log(`[burnCPU] Starting with ${fullCores} full cores and ${fractionalCore.toFixed(2)} fractional core`);

  for (let i = 0; i < fullCores; i++) {
    let active = true;

    const worker = async () => {
      console.log(`[burnCPU] Full core worker ${i} started.`);
      while (active) {
        const start = Date.now();
        while (Date.now() - start < 100) {
          Math.sqrt(Math.random());
        }
        await new Promise((resolve) => setImmediate(resolve));
      }
      console.log(`[burnCPU] Full core worker ${i} stopped.`);
    };

    worker.stop = () => { active = false; };
    worker();
    workers.push(worker);
  }

  if (fractionalCore > 0) {
    let active = true;
    const worker = async () => {
      console.log(`[burnCPU] Fractional core worker started.`);
      while (active) {
        const busyTime = fractionalCore * 50; // longer cycle to reduce overhead
        const idleTime = 50 - busyTime;

        const start = Date.now();
        while (Date.now() - start < busyTime) {
          Math.sqrt(Math.random());
        }

        await new Promise((resolve) => setTimeout(resolve, idleTime));
      }
      console.log(`[burnCPU] Fractional core worker stopped.`);
    };

    worker.stop = () => { active = false; };
    worker();
    workers.push(worker);
  }

  return () => workers.forEach((w) => w.stop());
}

function consumeRAM(mb) {
  console.log(`[consumeRAM] Allocating ${mb} MB of RAM`);
  const buffers = [];
  for (let i = 0; i < mb; i++) {
    const buf = Buffer.alloc(1024 * 1024);
    for (let j = 0; j < buf.length; j += 4096) {
      buf[j] = 0xff;
    }
    buffers.push(buf);
  }
  return buffers;
}

function simulateLoad({ cpu, ram, duration }) {
  console.log(`[simulateLoad] Starting load: CPU=${cpu}, RAM=${ram}, Duration=${duration}s`);
  const stopCPU = cpu > 0 ? burnCPU(cpu) : () => {};
  const buffers = ram > 0 ? consumeRAM(ram) : [];

  setTimeout(() => {
    console.log(`[simulateLoad] Stopping load`);
    stopCPU();
    buffers.length = 0;

    if (global.gc) {
      console.log("[simulateLoad] Forcing garbage collection...");
      global.gc();
    } else {
      console.warn("[simulateLoad] GC not available — run Node with --expose-gc");
    }

    console.log(`[simulateLoad] Load spike ended after ${duration}s.`);
  }, duration * 1000);
}

module.exports = { simulateLoad };
