import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const distDir = path.resolve(dirname, '../dist');
const index = path.join(distDir, 'index.js');

const options = {
	ecma: 2020
};

try {
	const file = await fs.readFile(index, 'utf-8');
	const result = await minify(file, options);
	if (!result.code) throw new Error('Could not minify');
	await fs.writeFile(index, result.code, 'utf-8');
} catch (err) {
	console.error(err);
	process.exit(1);
}
