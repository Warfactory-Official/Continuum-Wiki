// Fills the datapack and addon templates (templates/, bundled by scripts/templates.mjs) with a reader's settings and
// zips the result. Runs in the browser on the generator page and in Node in scripts/check-templates.mjs.
import { strToU8, zipSync } from 'fflate';

export const NODES = [
	{ id: '26.1-neoforge', mc: '26.1', loader: 'neoforge', label: '26.1 NeoForge' },
	{ id: '26.1-fabric', mc: '26.1', loader: 'fabric', label: '26.1 Fabric' },
	{ id: '1.21.1-neoforge', mc: '1.21.1', loader: 'neoforge', label: '1.21.1 NeoForge' },
	{ id: '1.21.1-fabric', mc: '1.21.1', loader: 'fabric', label: '1.21.1 Fabric' },
	{ id: '1.20.1-forge', mc: '1.20.1', loader: 'forge', label: '1.20.1 Forge' },
	{ id: '1.20.1-fabric', mc: '1.20.1', loader: 'fabric', label: '1.20.1 Fabric' },
];

// Data pack formats. 82 is where pack.mcmeta switched to min_format/max_format.
export const DATAPACK_VERSIONS = [
	{ id: '26.1', format: 101, label: '26.1' },
	{ id: '1.21.1', format: 48, label: '1.21.1' },
	{ id: '1.20.1', format: 15, label: '1.20.1' },
];
const NEW_FORMAT = 82;
const OVERLAY_DIR = 'overlay_1_21';

const RESERVED_IDS = ['minecraft', 'hbm', 'golemcore', 'ntmspace', 'neoforge', 'forge', 'fabric', 'fabricloader', 'c', 'java'];
const JAVA_KEYWORDS = new Set(
	('abstract assert boolean break byte case catch char class const continue default do double else enum extends final ' +
		'finally float for goto if implements import instanceof int interface long native new package private protected ' +
		'public return short static strictfp super switch synchronized this throw throws transient try void volatile while ' +
		'true false null record var yield sealed permits').split(' '),
);
// Text that goes through Gradle's expand() into JSON and TOML must not carry these.
const UNSAFE_TEXT = /["\\$\n\r]|'''/;

export function classNameFor(name) {
	const words = name.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
	let out = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
	if (!out) out = 'Addon';
	if (/^[0-9]/.test(out)) out = 'Mod' + out;
	return out;
}

/** Returns a map of field name to error message; empty when the settings are valid. */
export function validate(kind, s) {
	const err = {};
	const text = (key, label, required = true) => {
		const v = (s[key] ?? '').trim();
		if (required && !v) err[key] = `${label} is required.`;
		else if (UNSAFE_TEXT.test(v)) err[key] = `${label} cannot contain quotes, backslashes, $ or line breaks.`;
	};
	if (kind === 'datapack') {
		if (!/^[a-z0-9_.-]+$/.test(s.namespace ?? '')) err.namespace = 'Use lowercase letters, digits, _ . and -.';
		else if (['minecraft', 'hbm', 'c'].includes(s.namespace)) err.namespace = 'Use your own namespace.';
		text('packName', 'Pack name');
		text('description', 'Description', false);
		if (!s.versions?.length) err.versions = 'Pick at least one Minecraft version.';
		return err;
	}
	if (!/^[a-z][a-z0-9_]{1,63}$/.test(s.modId ?? ''))
		err.modId = 'Start with a lowercase letter; then lowercase letters, digits and _ (2 to 64 characters).';
	else if (RESERVED_IDS.includes(s.modId)) err.modId = 'That id belongs to another mod.';
	text('modName', 'Mod name');
	text('author', 'Author');
	text('description', 'Description', false);
	text('license', 'License');
	if (!/^[0-9][0-9A-Za-z.+-]*$/.test(s.version ?? '')) err.version = 'Start with a digit, for example 0.1.0.';
	if (s.homepage && !/^https?:\/\/[^\s"'\\$]+$/.test(s.homepage)) err.homepage = 'A web address starting with https://.';
	const segs = (s.package ?? '').split('.');
	if (segs.length < 2 || segs.some((p) => !/^[a-z_][a-z0-9_]*$/.test(p)))
		err.package = 'Lowercase segments separated by dots, at least two (com.example.myaddon).';
	else if (segs.some((p) => JAVA_KEYWORDS.has(p))) err.package = 'A segment is a Java keyword.';
	else if (['com.hbm', 'dev.golem'].some((p) => s.package === p || s.package.startsWith(p + '.')))
		err.package = 'Use your own package.';
	if (!/^[A-Z][A-Za-z0-9]*$/.test(s.className ?? '') || JAVA_KEYWORDS.has(s.className ?? ''))
		err.className = 'A Java class name starting with a capital letter.';
	if (!s.nodes?.length) err.nodes = 'Pick at least one target.';
	return err;
}

function render(text, vars, flags, where) {
	const sections = /^[ \t]*\{\{([#^])(\w+)\}\}[ \t]*\r?\n([\s\S]*?)^[ \t]*\{\{\/\2\}\}[ \t]*(?:\r?\n|$)/gm;
	let out = text.replace(sections, (_, kind, flag, body) => {
		if (!(flag in flags)) throw new Error(`${where}: unknown section ${flag}`);
		return (kind === '#') === Boolean(flags[flag]) ? body : '';
	});
	out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => {
		if (!(key in vars)) throw new Error(`${where}: unknown token ${key}`);
		return vars[key];
	});
	return out;
}

function underAny(path, prefixes) {
	return prefixes.some((p) => (p.endsWith('/') ? path.startsWith(p) : path === p));
}

function decodeBase64(b64) {
	if (typeof atob === 'function') return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	return new Uint8Array(Buffer.from(b64, 'base64'));
}

// Properties files are read as ISO-8859-1 by older tools, so anything outside ASCII is escaped.
const propEscape = (v) => v.replace(/\\/g, '\\\\').replace(/[^\x20-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const javaEscape = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const ktsEscape = (v) => javaEscape(v).replace(/\$/g, '\\$');

/** The node a fresh checkout is switched to: the first picked node in NODES order. */
export function activeNodeOf(nodes) {
	return NODES.find((n) => nodes.includes(n.id)).id;
}

function addonFiles(manifest, s) {
	const tpl = manifest.templates.addon;
	const nodes = NODES.filter((n) => s.nodes.includes(n.id));
	const loaders = new Set(nodes.map((n) => n.loader));
	const active = activeNodeOf(s.nodes);
	const activeLoader = NODES.find((n) => n.id === active).loader;
	const byMc = [];
	for (const n of nodes) {
		let row = byMc.find((r) => r.mc === n.mc);
		if (!row) byMc.push((row = { mc: n.mc, loaders: [] }));
		row.loaders.push(n.loader);
	}
	const description = (s.description ?? '').trim() || `An addon for NTM - Continuum.`;
	const { golemcore, hbm, gemrender } = manifest.curseforge;
	const homepage = (s.homepage ?? '').trim().replace(/\/+$/, '');
	const issues = /^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(homepage) ? homepage + '/issues' : homepage;
	const vars = {
		modId: s.modId,
		modName: s.modName.trim(),
		modNameProp: propEscape(s.modName.trim()),
		modNameJava: javaEscape(s.modName.trim()),
		modNameKts: ktsEscape(s.modName.trim()),
		package: s.package,
		packagePath: s.package.replace(/\./g, '/'),
		className: s.className,
		modVersion: s.version,
		authorProp: propEscape(s.author.trim()),
		licenseProp: propEscape(s.license.trim()),
		descriptionProp: propEscape(description),
		homepageProp: propEscape(homepage),
		sourcesProp: propEscape(homepage),
		issuesProp: propEscape(issues),
		activeNode: active,
		nodeList: nodes.map((n) => n.label).join(', '),
		stonecutterMatches: byMc
			.map((r) => `        match("${r.mc}", ${[...r.loaders].sort().map((l) => `"${l}"`).join(', ')})`)
			.join('\n'),
		golemVersion: golemcore.version,
		hbmVersion: hbm.version,
		gemVersion: gemrender.version,
		neoforgeOpen: activeLoader === 'neoforge' ? '' : '/*',
		neoforgeClose: activeLoader === 'neoforge' ? '' : '*/',
		forgeOpen: activeLoader === 'forge' ? '' : '/*',
		forgeClose: activeLoader === 'forge' ? '' : '*/',
	};
	const flags = { example: Boolean(s.example), links: Boolean(homepage), neoforge: loaders.has('neoforge'), forge: loaders.has('forge'), fabric: loaders.has('fabric') };
	const out = [];
	for (const f of tpl.files) {
		if (f.path === 'template.json') continue;
		const skipped = Object.entries(tpl.meta.when).some(
			([flag, paths]) => !flags[flag] && underAny(f.path, paths),
		);
		if (skipped) continue;
		let nodeVars = vars;
		if (f.path.startsWith(tpl.meta.nodeFolder)) {
			const node = f.path.slice(tpl.meta.nodeFolder.length).split('/')[0];
			if (!s.nodes.includes(node)) continue;
			nodeVars = { ...vars, golemFile: golemcore.files[node], hbmFile: hbm.files[node], gemFile: gemrender.files[node] };
		}
		const path = render(f.path, nodeVars, flags, f.path);
		const data = f.base64 != null ? decodeBase64(f.base64) : render(f.text, nodeVars, flags, f.path);
		out.push({ path, data, executable: tpl.meta.executable.includes(f.path) });
	}
	return out;
}

/** pack.mcmeta for the picked versions; overlays only when 1.20.1 is picked together with a newer version. */
export function packMcmeta(versions, description) {
	const formats = DATAPACK_VERSIONS.filter((v) => versions.includes(v.id)).map((v) => v.format).sort((a, b) => a - b);
	const min = formats[0];
	const max = formats[formats.length - 1];
	const pack = { description };
	if (min < NEW_FORMAT) pack.pack_format = min;
	if (min < NEW_FORMAT && min !== max) pack.supported_formats = [min, max];
	if (max >= NEW_FORMAT) Object.assign(pack, { min_format: min, max_format: max });
	const meta = { pack };
	const newer = formats.filter((f) => f !== 15);
	if (formats.includes(15) && newer.length) {
		const lo = newer[0];
		const entry = {};
		// 26.1 rejects "formats" on an entry that covers only the new scheme.
		if (lo < NEW_FORMAT) entry.formats = [lo, max];
		if (max >= NEW_FORMAT) Object.assign(entry, { min_format: lo, max_format: max });
		entry.directory = OVERLAY_DIR;
		meta.overlays = { entries: [entry] };
	}
	return JSON.stringify(meta, null, 2) + '\n';
}

function datapackFiles(manifest, s) {
	const tpl = manifest.templates.datapack;
	const has120 = s.versions.includes('1.20.1');
	const overlay = has120 && s.versions.length > 1;
	const description = (s.description ?? '').trim() || s.packName.trim();
	const folderName = s.namespace;
	const base = {
		packName: s.packName.trim(),
		namespace: s.namespace,
		folderName,
		overlayDir: OVERLAY_DIR,
		versionList: DATAPACK_VERSIONS.filter((v) => s.versions.includes(v.id)).map((v) => v.label).reverse().join(', '),
	};
	const flags = { example: Boolean(s.example), overlay };
	// Vanilla folders under versionedFolders use the plural spelling for 1.20.1 and the singular one after it.
	const spellings = overlay ? [{ recipe: 'recipes', root: '' }, { recipe: 'recipe', root: OVERLAY_DIR + '/' }]
		: [{ recipe: has120 ? 'recipes' : 'recipe', root: '' }];
	const out = [{ path: 'pack.mcmeta', data: packMcmeta(s.versions, description) }];
	for (const f of tpl.files) {
		if (f.path === 'template.json') continue;
		const skipped = Object.entries(tpl.meta.when).some(
			([flag, paths]) => !flags[flag] && underAny(f.path, paths),
		);
		if (skipped) continue;
		const versioned = underAny(f.path, tpl.meta.versionedFolders);
		for (const sp of versioned ? spellings : [spellings[0]]) {
			const vars = { ...base, recipe: sp.recipe };
			out.push({ path: sp.root + render(f.path, vars, flags, f.path), data: render(f.text, vars, flags, f.path) });
		}
	}
	return out;
}

/** The files of a generated project, each { path, data: string | Uint8Array, executable }. */
export function generateFiles(manifest, kind, settings) {
	return kind === 'addon' ? addonFiles(manifest, settings) : datapackFiles(manifest, settings);
}

/** The addon zip holds one project folder; the datapack zip is the pack itself, so it loads without unzipping. */
export function generateZip(manifest, kind, settings) {
	const top = kind === 'addon' ? settings.modId + '/' : '';
	const entries = {};
	for (const f of generateFiles(manifest, kind, settings)) {
		const bytes = typeof f.data === 'string' ? strToU8(f.data) : f.data;
		// Unix mode in the external attributes, so gradlew stays executable after unzipping.
		const mode = f.executable ? 0o100755 : 0o100644;
		entries[top + f.path] = [bytes, { os: 3, attrs: (mode << 16) >>> 0 }];
	}
	const name = kind === 'addon' ? settings.modId : settings.namespace;
	return { name: `${name}.zip`, bytes: zipSync(entries, { level: 6 }) };
}
