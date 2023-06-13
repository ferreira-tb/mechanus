import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        watch: true,
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        typecheck: {
            tsconfig: './tsconfig.json'
        }
    }
});