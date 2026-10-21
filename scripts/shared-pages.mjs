// Copies the pages in src/shared/ (machine recipes, data maps, data files, reference) into every topic, so each of
// Datapacks, KubeJS and Addon mods has the full set under its own sidebar. Shared pages are written as if they lived in
// the datapacks topic; links into another shared page are pointed at the same topic's copy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = path.join(ROOT, 'src', 'shared');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');
const REPO = 'https://github.com/Warfactory-Official/Continuum-Wiki';

export const SHARED_FOLDERS = ['recipes', 'data-maps', 'data', 'reference'];

// The note at the top of each copy says where the files go for that audience. Copies sit two levels into the topic.
const TOPICS = {
	datapacks: { search: true, note: () => null },
	kubejs: {
		search: false,
		note: (folder) =>
			':::tip[In a KubeJS pack]\n' +
			'The files on this page go in `kubejs/data/<namespace>/`, which KubeJS loads as a datapack.' +
			(folder === 'recipes'
				? ' Machine recipes can also be written in scripts, with the same fields: see [Recipe scripts](../../recipe-scripts/).'
				: '') +
			'\n:::',
	},
	addons: {
		search: false,
		note: (folder) =>
			':::tip[In an addon mod]\n' +
			'Ship the files on this page in your jar under `src/main/resources/data/<your namespace>/`, or generate them ' +
			'from Java sources: see [Recipes and data](../../recipes-and-data/).' +
			(folder === 'data-maps' ? ' To read or declare data maps in code, see [Data maps in Java](../../java-data-maps/).' : '') +
			'\n:::',
	},
};

function walk(dir) {
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p));
		else if (/\.mdx?$/.test(e.name)) out.push(p);
	}
	return out;
}

function relative(fromUrl, toUrl) {
	const f = fromUrl.split('/').filter(Boolean);
	const t = toUrl.split('/').filter(Boolean);
	let i = 0;
	while (i < f.length && i < t.length && f[i] === t[i]) i++;
	const r = '../'.repeat(f.length - i) + t.slice(i).join('/') + (t.length > i ? '/' : '');
	return r || './';
}

function rewriteLinks(text, pageUrl, topic) {
	const fix = (href) => {
		if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
		const [p, anchor] = href.split('#');
		let abs = new URL(p, 'http://x/datapacks' + pageUrl).pathname;
		const m = abs.match(/^\/datapacks\/([^/]+)\//);
		if (m && SHARED_FOLDERS.includes(m[1])) abs = '/' + topic + abs.slice('/datapacks'.length);
		return relative('/' + topic + pageUrl, abs) + (anchor !== undefined ? '#' + anchor : '');
	};
	return text
		.replace(/\]\(([^)\s]+)\)/g, (_, h) => '](' + fix(h) + ')')
		.replace(/href="([^"]+)"/g, (_, h) => 'href="' + fix(h) + '"');
}

function copyFor(file, topic) {
	const rel = path.relative(SHARED, file).split(path.sep).join('/');
	const pageUrl = '/' + rel.replace(/\.mdx?$/, '') + '/';
	const source = fs.readFileSync(file, 'utf8');
	const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) throw new Error(`${rel}: missing frontmatter`);
	const { search, note } = TOPICS[topic];
	const front = [
		m[1],
		`editUrl: ${REPO}/edit/main/src/shared/${rel}`,
		...(search ? [] : ['pagefind: false']),
	].join('\n');
	const body = rewriteLinks(m[2], pageUrl, topic);
	const folder = rel.split('/')[0];
	const text = folder === 'reference' ? null : note(folder);
	const withNote = text ? text + '\n\n' + body : body;
	const dest = path.join(DOCS, topic, rel);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	const out = `---\n${front}\n---\n\n${withNote.replace(/^\s+/, '')}`;
	if (!fs.existsSync(dest) || fs.readFileSync(dest, 'utf8') !== out) fs.writeFileSync(dest, out);
}

export function generateSharedPages() {
	for (const topic of Object.keys(TOPICS)) {
		for (const folder of SHARED_FOLDERS) fs.rmSync(path.join(DOCS, topic, folder), { recursive: true, force: true });
	}
	for (const file of walk(SHARED)) for (const topic of Object.keys(TOPICS)) copyFor(file, topic);
}

/** Astro integration: generates the copies before the build, and again in dev when a shared page changes. */
export default function sharedPages() {
	return {
		name: 'shared-pages',
		hooks: {
			'astro:config:setup': () => generateSharedPages(),
			'astro:server:setup': ({ server }) => {
				server.watcher.add(SHARED);
				server.watcher.on('all', (_event, file) => {
					if (path.resolve(file).startsWith(SHARED)) generateSharedPages();
				});
			},
		},
	};
}
