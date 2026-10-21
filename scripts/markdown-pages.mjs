// Every page as Markdown next to its HTML (/x/y/ is also /x/y.md), for the "Open in AI chat" menu, which asks the
// chat service to read that copy, and for its "Open as Markdown" entry. Written after the build, served on request in
// dev, and listed in llms.txt. Links are made absolute so they work from wherever the copy is read.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');

function walk(dir) {
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p));
		else if (/\.mdx?$/.test(e.name)) out.push(p);
	}
	return out;
}

function field(front, key) {
	const m = front.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	return m ? m[1].trim().replace(/^(["'])(.*)\1$/, '$2') : undefined;
}

/** The page at `file` as Markdown, with links resolved against `root` (the site URL with its base path). */
function toMarkdown(file, root) {
	const slug = path.relative(DOCS, file).split(path.sep).join('/').replace(/\.mdx?$/, '');
	const source = fs.readFileSync(file, 'utf8');
	const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	const front = m ? m[1] : '';
	const title = field(front, 'title') ?? slug;
	const description = field(front, 'description');
	const pageUrl = root + slug + '/';
	const body = (m ? m[2] : source)
		.replace(/^import .+;?\r?\n/gm, '')
		.replace(/\]\(([^)\s]+)\)/g, (all, href) =>
			/^(https?:|mailto:|#)/.test(href) ? all : `](${new URL(href, pageUrl).href})`,
		)
		.trim();
	return { slug, title, description, text: `# ${title}\n\n${description ? `> ${description}\n\n` : ''}${body}\n` };
}

/** @param {{ site: string, base: string, title: string }} options site is the full URL with the base path. */
export default function markdownPages({ site, base, title }) {
	const root = site.replace(/\/?$/, '/');
	const basePath = base.replace(/\/?$/, '/');
	return {
		name: 'markdown-pages',
		hooks: {
			// A Vite plugin, so the handler runs before Astro's own, which would answer with a 404 page.
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: 'markdown-pages-dev',
								configureServer(server) {
									server.middlewares.use((req, res, next) => {
										// Vite may have stripped the base path already.
										let url = decodeURIComponent((req.url ?? '').split('?')[0]);
										if (url.startsWith(basePath)) url = '/' + url.slice(basePath.length);
										if (!url.endsWith('.md')) return next();
										const slug = url.slice(1, -3);
										const file = ['.md', '.mdx']
											.map((ext) => path.join(DOCS, slug + ext))
											.find((f) => fs.existsSync(f));
										if (!file || slug.includes('..')) return next();
										res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
										res.end(toMarkdown(file, root).text);
									});
								},
							},
						],
					},
				});
			},
			'astro:build:done': ({ dir }) => {
				const dist = fileURLToPath(dir);
				const entries = [];
				for (const file of walk(DOCS)) {
					const page = toMarkdown(file, root);
					if (page.slug === 'index') continue;
					const out = path.join(dist, page.slug + '.md');
					fs.mkdirSync(path.dirname(out), { recursive: true });
					fs.writeFileSync(out, page.text);
					// The shared pages are listed once, from the datapacks topic.
					if (/^(kubejs|addons)\/(recipes|data-maps|data|reference)\//.test(page.slug)) continue;
					entries.push(`- [${page.title}](${root}${page.slug}.md)${page.description ? ': ' + page.description : ''}`);
				}
				entries.sort();
				fs.writeFileSync(path.join(dist, 'llms.txt'), `# ${title}\n\n${entries.join('\n')}\n`);
			},
		},
	};
}
