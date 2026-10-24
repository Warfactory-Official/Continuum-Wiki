// Bundles templates/ into public/generator/manifest.json for the template generator page (src/generator/generate.js).
// At build time it also looks up the newest CurseForge files of Golem Core, NTM - Continuum and GemRender for every
// node, Golem Core's shared build scripts at that release's tag, and NTM - Continuum's per-node dependency versions at
// its tag. Each lookup falls back to what templates/ holds, so an offline build still works, with older versions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = path.join(ROOT, 'templates');
const OUT = path.join(ROOT, 'public', 'generator', 'manifest.json');

const PROJECTS = {
	golemcore: { id: 1719361, repo: 'Golem-Core' },
	hbm: { id: 1719328, repo: 'NTM-Continuum' },
	gemrender: { id: 1735539 },
};
const NODE_GAME = {
	'26.1-neoforge': ['26.1.2', 'NeoForge'],
	'26.1-fabric': ['26.1.2', 'Fabric'],
	'1.21.1-neoforge': ['1.21.1', 'NeoForge'],
	'1.21.1-fabric': ['1.21.1', 'Fabric'],
	'1.20.1-forge': ['1.20.1', 'Forge'],
	'1.20.1-fabric': ['1.20.1', 'Fabric'],
};
// Keys of a node's gradle.properties that follow NTM - Continuum's file for the same node.
const HBM_NODE_KEYS = [
	'deps.minecraft', 'deps.minecraft_range', 'java_version', 'pack_format', 'deps.neoforge', 'deps.neoforge_floor',
	'deps.neoforge_loader_range', 'deps.forge', 'deps.forge_loader_range', 'deps.fabric_loader', 'deps.fabric_api',
	'deps.jei_mc', 'deps.jei', 'deps.lwjgl', 'deps.gemrender_flywheel',
];

function walk(dir, base = dir) {
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p, base));
		else out.push(path.relative(base, p).split(path.sep).join('/'));
	}
	return out.sort();
}

async function get(url, as = 'text') {
	const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return as === 'json' ? res.json() : res.text();
}

function readProps(text) {
	const out = {};
	for (const line of text.split(/\r?\n/)) {
		const m = line.match(/^([\w.]+)=(.*)$/);
		if (m) out[m[1]] = m[2].trim();
	}
	return out;
}

/** The CurseForge files in templates/curseforge.json: the offline fallback. */
function fallbackFiles() {
	return JSON.parse(fs.readFileSync(path.join(TEMPLATES, 'curseforge.json'), 'utf8'));
}

/** Newest file per node from the CurseForge listing (cfwidget), matched by game version and loader tags. */
async function latestFiles(key) {
	const data = await get(`https://api.cfwidget.com/${PROJECTS[key].id}`, 'json');
	const files = {};
	let version = null;
	for (const [node, [mc, loader]] of Object.entries(NODE_GAME)) {
		const match = (data.files ?? [])
			.filter((f) => f.versions.includes(mc) && f.versions.includes(loader))
			.sort((a, b) => (a.type === 'release') - (b.type === 'release') || Date.parse(a.uploaded_at) - Date.parse(b.uploaded_at))
			.pop();
		if (!match) throw new Error(`${key}: no CurseForge file for ${node}`);
		files[node] = String(match.id);
		const v = match.name.match(/(\d+\.\d+\.\d+)(?:\+[\w.]+)?\.jar$/)?.[1];
		if (!v) throw new Error(`${key}: cannot read a version from ${match.name}`);
		if (version && version !== v) throw new Error(`${key}: nodes are on different versions (${version}, ${v})`);
		version = v;
	}
	return { version, files };
}

async function curseforge(log) {
	const fallback = fallbackFiles();
	const out = {};
	for (const key of Object.keys(PROJECTS)) {
		try {
			out[key] = { ...(await latestFiles(key)), source: 'curseforge' };
		} catch (e) {
			log.warn(`template generator: ${e.message}; using the files in templates/`);
			out[key] = { ...fallback[key], source: 'templates' };
		}
	}
	return out;
}

/** Golem Core's shared scripts at the tag of the picked release, else the copies in templates/addon/gradle/golem. */
async function golemScripts(version, files, log) {
	const scripts = files.filter((f) => f.startsWith('gradle/golem/'));
	try {
		const texts = await Promise.all(scripts.map((f) => get(
			`https://raw.githubusercontent.com/Warfactory-Official/Golem-Core/v${version}/gradle/mod/${path.basename(f)}`)));
		return Object.fromEntries(scripts.map((f, i) => [f, texts[i]]));
	} catch (e) {
		log.warn(`template generator: Golem Core scripts at v${version}: ${e.message}; using templates/addon/gradle/golem`);
		return {};
	}
}

/** NTM - Continuum's per-node dependency versions at its release tag, written over the template's node files. */
async function hbmNodeProps(version, log) {
	try {
		const entries = await Promise.all(Object.keys(NODE_GAME).map(async (node) => [node, readProps(await get(
			`https://raw.githubusercontent.com/Warfactory-Official/NTM-Continuum/v${version}/versions/${node}/gradle.properties`))]));
		return Object.fromEntries(entries);
	} catch (e) {
		log.warn(`template generator: NTM - Continuum node versions at v${version}: ${e.message}; using templates/addon/versions`);
		return {};
	}
}

function withHbmValues(text, props) {
	return text.replace(/^([\w.]+)=(.*)$/gm, (line, key) =>
		HBM_NODE_KEYS.includes(key) && key in props ? `${key}=${props[key]}` : line);
}

function bundle(kind, overrides = {}) {
	const dir = path.join(TEMPLATES, kind);
	const meta = JSON.parse(fs.readFileSync(path.join(dir, 'template.json'), 'utf8'));
	const files = walk(dir).map((rel) => {
		const bytes = fs.readFileSync(path.join(dir, rel));
		if (meta.binary.includes(rel)) return { path: rel, base64: bytes.toString('base64') };
		const text = overrides[rel] ?? bytes.toString('utf8').replace(/\r\n/g, '\n');
		return { path: rel, text: rel.endsWith('.bat') ? text.replace(/\n/g, '\r\n') : text };
	});
	return { meta, files };
}

export async function buildManifest(log = console) {
	const cf = await curseforge(log);
	const addonFiles = walk(path.join(TEMPLATES, 'addon'));
	const overrides = await golemScripts(cf.golemcore.version, addonFiles, log);
	const hbmProps = await hbmNodeProps(cf.hbm.version, log);
	for (const [node, props] of Object.entries(hbmProps)) {
		const rel = `versions/${node}/gradle.properties`;
		overrides[rel] = withHbmValues(fs.readFileSync(path.join(TEMPLATES, 'addon', rel), 'utf8').replace(/\r\n/g, '\n'), props);
	}
	const manifest = {
		built: new Date().toISOString(),
		curseforge: cf,
		sources: {
			golemScripts: Object.keys(overrides).some((f) => f.startsWith('gradle/golem/')) ? `Golem-Core v${cf.golemcore.version}` : 'templates',
			nodeVersions: Object.keys(hbmProps).length ? `NTM-Continuum v${cf.hbm.version}` : 'templates',
		},
		templates: { addon: bundle('addon', overrides), datapack: bundle('datapack') },
	};
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	fs.writeFileSync(OUT, JSON.stringify(manifest));
	log.info(`template generator: Golem Core ${cf.golemcore.version}, NTM - Continuum ${cf.hbm.version}, GemRender ` +
		`${cf.gemrender.version} (${cf.golemcore.source}); scripts from ${manifest.sources.golemScripts}, node versions ` +
		`from ${manifest.sources.nodeVersions}`);
	return manifest;
}

/** Astro integration: writes the manifest before the build and when dev starts. */
export default function templates() {
	return {
		name: 'template-generator',
		hooks: {
			'astro:config:setup': async ({ logger }) => {
				await buildManifest(logger);
			},
		},
	};
}
