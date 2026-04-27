module.exports = {
  apps: [{
    name: "csv-processor-queue",
    script: "ts-node",
    args: "src/index.ts",
    instances: "max",  // Chạy max cores
    exec_mode: "cluster",  // Cluster mode
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",  // Restart nếu memory >1G
    env: {
      NODE_ENV: "production",
    },
  }],
};