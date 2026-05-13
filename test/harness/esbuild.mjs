import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (...parts) => path.resolve(__dirname, ...parts);

await build({
	entryPoints: [resolve('./index.ts')],
	outfile: resolve('./dist/bundle.js'),
	format: 'iife',
	platform: 'browser',
	sourcemap: true,
	bundle: true,
	alias: {
		'obsidian':        resolve('./obsidian-mock.ts'),
		'fs':              resolve('./mocks/fs.ts'),
		'path':            resolve('./mocks/path.ts'),
		'child_process':   resolve('./mocks/child_process.ts'),
		'util':            resolve('./mocks/util.ts'),
	},
	define: {
		'process.env': '{}',
	},
});

console.log('[harness] bundle built → test/harness/dist/bundle.js');
