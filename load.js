function burnCPU(cores) {
  const workers = [];
  for (let i = 0; i < cores; i++) {
    const worker = setInterval(() => {
      let x = 0;
      while (true) { x += Math.sqrt(Math.random()); } // tight loop
    }, 0);
    workers.push(worker);
  }
  return () => workers.forEach(clearInterval);
}

function consumeRAM(mb) {
  const buffers = [];
  for (let i = 0; i < mb; i++) {
    buffers.push(Buffer.alloc(1024 * 1024)); // 1MB per buffer
  }
  return () => buffers.splice(0, buffers.length); // clear memory
}

function simulateLoad({ cpu, ram, duration }) {
  const stopCPU = cpu > 0 ? burnCPU(cpu) : () => {};
  const stopRAM = ram > 0 ? consumeRAM(ram) : () => {};

  setTimeout(() => {
    stopCPU();
    stopRAM();
    console.log('Load spike ended.');
  }, duration * 1000);
}

module.exports = { simulateLoad };
