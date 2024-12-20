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
                test: resolve(__dirname, "test.html"),
            },
        },
    },
});

