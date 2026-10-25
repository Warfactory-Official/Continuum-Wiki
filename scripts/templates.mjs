// Bundles templates/ into public/generator/manifest.json for the template generator page (src/generator/generate.js).
// At build time it also looks up the newest GitHub releases of Golem Core and NTM - Continuum, GemRender's newest
// CurseForge file for every node, Golem Core's shared build scripts at that release's tag, and NTM - Continuum's per-node
// dependency versions at its tag. Each lookup falls back to what templates/ holds, so an offline build still works, with
// older versions.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = path.join(ROOT, 'templates');
const OUT = path.join(ROOT, 'public', 'generator', 'manifest.json');
// The picked releases and each node's versions: scripts/check-releases.mjs compares the releases with the newest ones,
// and the project setup page shows both (src/generator/releases.ts).
const RELEASES = path.join(ROOT, 'public', 'generator', 'releases.json');

// Golem Core and NTM - Continuum come from their GitHub releases, GemRender from CurseForge (CurseMaven).
export const PROJECTS = {
	golemcore: { repo: 'Golem-Core', jar: 'golemcore' },
	hbm: { repo: 'NTM-Continuum', jar: 'hbm' },
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
	'deps.jei_mc', 'deps.jei', 'deps.lwjgl', 'deps.gemrender_flywheel', 'deps.sodium_neoforge', 'deps.sodium_fabric',
	'deps.indium', 'deps.embeddium',
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

async function get(url, as = 'text', headers = {}) {
	const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
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

/** The releases in templates/releases.json: the offline fallback. */
function fallbackReleases() {
	return JSON.parse(fs.readFileSync(path.join(TEMPLATES, 'releases.json'), 'utf8'));
}

/** A node's jar in a GitHub release, e.g. golemcore-neoforge-1.0.2+26.1.jar; up to 1.0.1 golemcore-neoforge-26.1-1.0.1+26.1.jar. */
function assetNames(jar, node, version) {
	const mc = node.slice(0, node.indexOf('-'));
	const loader = node.slice(mc.length + 1);
	return [`${jar}-${loader}-${version}+${mc}.jar`, `${jar}-${loader}-${mc}-${version}+${mc}.jar`];
}

/**
 * The newest GitHub release (not a pre-release) of Golem Core or NTM - Continuum, refused until it carries a jar for
 * every node. Sends GITHUB_TOKEN when set: without it the API allows 60 requests an hour per address.
 */
async function latestRelease(key) {
	const { repo, jar } = PROJECTS[key];
	const headers = { accept: 'application/vnd.github+json' };
	if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	const release = await get(`https://api.github.com/repos/Warfactory-Official/${repo}/releases/latest`, 'json', headers);
	const version = release.tag_name.replace(/^v/, '');
	const assets = new Set(release.assets.map((a) => a.name));
	const jars = Object.keys(NODE_GAME).map((node) => assetNames(jar, node, version).find((name) => assets.has(name))
		?? assetNames(jar, node, version)[0]);
	const missing = jars.filter((name) => !assets.has(name));
	if (missing.length) throw new Error(`${key} v${version} has no ${missing.join(', ')}`);
	if (key !== 'golemcore') return { version };
	const harness = [...jars.map((name) => name.replace(/\.jar$/, '-dev.jar')), 'golem-harness.jar'].filter((name) => !assets.has(name));
	return { version, ...(harness.length && { harnessMissing: harness }) };
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

/** The newest release of a project: { version, files? (CurseForge file id per node), source }. */
export async function latest(key) {
	return PROJECTS[key].repo ? { ...(await latestRelease(key)), source: 'github' } : { ...(await latestFiles(key)), source: 'curseforge' };
}

async function releases(log) {
	const fallback = fallbackReleases();
	const out = {};
	for (const key of Object.keys(PROJECTS)) {
		try {
			out[key] = await latest(key);
		} catch (e) {
			log.warn(`template generator: ${e.message}; using templates/releases.json`);
			out[key] = { ...fallback[key], source: 'templates' };
		}
	}
	if (out.golemcore.harnessMissing) {
		log.warn(`template generator: Golem Core v${out.golemcore.version} has no ${out.golemcore.harnessMissing.join(', ')}; ` +
			'the harness of generated projects cannot download them');
	}
	return out;
}

/** Golem Core's shared scripts at the tag of the picked release; a script missing there keeps its templates/addon copy. */
async function golemScripts(version, files, log) {
	const scripts = files.filter((f) => f.startsWith('gradle/golem/'));
	const results = await Promise.allSettled(scripts.map((f) => get(
		`https://raw.githubusercontent.com/Warfactory-Official/Golem-Core/v${version}/gradle/mod/${path.basename(f)}`)));
	const out = {};
	results.forEach((r, i) => {
		if (r.status === 'fulfilled') out[scripts[i]] = r.value;
		else log.warn(`template generator: Golem Core ${scripts[i]} at v${version}: ${r.reason.message}; using templates/addon`);
	});
	return out;
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

/** Each node's gradle.properties as the generator writes it, with this build's GemRender files, for the docs pages. */
function nodeFiles(files, picked) {
	return Object.fromEntries(Object.keys(NODE_GAME).map((node) => [node, files
		.find((f) => f.path === `versions/${node}/gradle.properties`).text
		.replace('{{gemFile}}', picked.gemrender.files[node])]));
}

export async function buildManifest(log = console) {
	const picked = await releases(log);
	const addonFiles = walk(path.join(TEMPLATES, 'addon'));
	const overrides = await golemScripts(picked.golemcore.version, addonFiles, log);
	const hbmProps = await hbmNodeProps(picked.hbm.version, log);
	for (const [node, props] of Object.entries(hbmProps)) {
		const rel = `versions/${node}/gradle.properties`;
		overrides[rel] = withHbmValues(fs.readFileSync(path.join(TEMPLATES, 'addon', rel), 'utf8').replace(/\r\n/g, '\n'), props);
	}
	const manifest = {
		built: new Date().toISOString(),
		releases: picked,
		sources: {
			golemScripts: Object.keys(overrides).some((f) => f.startsWith('gradle/golem/')) ? `Golem-Core v${picked.golemcore.version}` : 'templates',
			nodeVersions: Object.keys(hbmProps).length ? `NTM-Continuum v${picked.hbm.version}` : 'templates',
		},
		templates: { addon: bundle('addon', overrides), datapack: bundle('datapack') },
	};
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	fs.writeFileSync(OUT, JSON.stringify(manifest));
	fs.writeFileSync(RELEASES, JSON.stringify({ ...picked, nodes: nodeFiles(manifest.templates.addon.files, picked) }));
	log.info(`template generator: Golem Core ${picked.golemcore.version} (${picked.golemcore.source}), NTM - Continuum ` +
		`${picked.hbm.version} (${picked.hbm.source}), GemRender ${picked.gemrender.version} (${picked.gemrender.source}); ` +
		`scripts from ${manifest.sources.golemScripts}, node versions from ${manifest.sources.nodeVersions}`);
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
