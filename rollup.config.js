import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath, URL } from 'node:url';

export default [
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            generatedCode: 'es2015'
        },
        plugins: [
            alias({ '@': fileURLToPath(new URL('./src', import.meta.url)) }),
            typescript({ tsconfig: 'tsconfig.json' })
        ]
    }
];