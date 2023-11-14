import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig([
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.js',
			format: 'es',
			generatedCode: 'es2015'
		},
		plugins: [typescript()]
	}
]);
