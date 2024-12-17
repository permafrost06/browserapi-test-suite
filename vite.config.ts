import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [],
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                test: resolve(__dirname, "test.html"),
            },
        },
    },
});

