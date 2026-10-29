// Writes generated projects to a folder, to build or load them outside the browser:
//   node scripts/check-templates.mjs <out dir> [addon|datapack] [settings JSON]
import fs from 'node:fs';
import path from 'node:path';
import { unzipSync } from 'fflate';
import { buildManifest } from './templates.mjs';
import { classNameFor, generateZip, NODES, validate } from '../src/generator/generate.js';

const [outDir, only, json] = process.argv.slice(2);
if (!outDir) throw new Error('usage: node scripts/check-templates.mjs <out dir> [addon|datapack] [settings JSON]');

const defaults = {
	addon: {
		modId: 'exampleaddon', modName: 'Example Addon', package: 'com.example.exampleaddon', className: classNameFor('Example Addon'),
		author: 'You', version: '0.1.0', license: 'LGPL-3.0-only', description: '', nodes: NODES.map((n) => n.id), example: true,
	},
	datapack: { namespace: 'mypack', packName: 'My HBM tweaks', description: '', versions: ['26.1', '1.21.1', '1.20.1'], example: true },
};

const manifest = await buildManifest();
for (const kind of only ? [only] : ['addon', 'datapack']) {
	const settings = { ...defaults[kind], ...(json ? JSON.parse(json) : {}) };
	const errors = validate(kind, settings);
	if (Object.keys(errors).length) throw new Error(`${kind}: ${JSON.stringify(errors)}`);
	const { name, bytes } = generateZip(manifest, kind, settings);
	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(path.join(outDir, name), bytes);
	// The datapack zip has no top folder; unzip it into one named after the namespace.
	const folder = kind === 'addon' ? outDir : path.join(outDir, settings.namespace);
	for (const [file, data] of Object.entries(unzipSync(bytes))) {
		const dest = path.join(folder, file);
		fs.mkdirSync(path.dirname(dest), { recursive: true });
		fs.writeFileSync(dest, data);
	}
	console.log(`${kind}: ${name}, ${bytes.length} bytes`);
}
