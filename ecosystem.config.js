module.exports = {
    apps: [
        {
            name: "ignite-backend",
            script: "dist/server.js",
            instances: "max",
            exec_mode: "cluster",
            watch: false,
            max_memory_restart: "500M",
            env: { NODE_ENV: "production" },
            out_file: "logs/out.log",
            error_file: "logs/error.log",
            merge_logs: true,
            kill_timeout: 5000
        }
    ]
};