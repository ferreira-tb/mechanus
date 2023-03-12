import alias from '@rollup/plugin-alias';
import dts from "rollup-plugin-dts";
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
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
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.d.ts',
        },
        plugins: [
            typescript({ tsconfig: 'tsconfig.json' }),
            alias({ '@': fileURLToPath(new URL('./src', import.meta.url)) }),
            nodeResolve(),
            dts()
        ]
    }
];