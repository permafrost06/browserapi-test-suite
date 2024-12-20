import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    base: "",
    plugins: [],
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                runner: resolve(__dirname, "runner.html"),
                watcher: resolve(__dirname, "watcher.html"),
            },
        },
    },
});

