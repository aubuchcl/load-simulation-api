function burnCPU(cores) {
  const workers = [];

  for (let i = 0; i < cores; i++) {
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

  return () => workers.forEach((w) => w.stop());
}

function consumeRAM(mb) {
  const buffers = [];
  for (let i = 0; i < mb; i++) {
    buffers.push(Buffer.alloc(1024 * 1024));
  }
  return () => buffers.splice(0, buffers.length);
}

function simulateLoad({ cpu, ram, duration }) {
  const stopCPU = cpu > 0 ? burnCPU(cpu) : () => {};
  const stopRAM = ram > 0 ? consumeRAM(ram) : () => {};

  setTimeout(() => {
    stopCPU();
    stopRAM();
    console.log(`Load spike ended after ${duration}s.`);
  }, duration * 1000);
}

module.exports = { simulateLoad };
