// The releases the template generator was built with (public/generator/releases.json, written by scripts/templates.mjs
// before every build), for pages that quote versions and CurseForge file ids. A new release reaches them on the next
// build, as it reaches the generator.
import fs from 'node:fs';
import path from 'node:path';

interface Release {
	version: string;
	files: Record<string, string>;
}

const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'generator', 'releases.json'), 'utf8'));

export const golemcore: Release = data.golemcore;
export const hbm: Release = data.hbm;
export const gemrender: Release = data.gemrender;

export const NODES: [string, string][] = [
	['26.1-neoforge', '26.1 NeoForge'],
	['26.1-fabric', '26.1 Fabric'],
	['1.21.1-neoforge', '1.21.1 NeoForge'],
	['1.21.1-fabric', '1.21.1 Fabric'],
	['1.20.1-forge', '1.20.1 Forge'],
	['1.20.1-fabric', '1.20.1 Fabric'],
];

/** A node's versions/<node>/gradle.properties as the template generator writes it. */
export function nodeFile(node: string): string {
	return data.nodes[node];
}

/** The node file without its comments, for an example on a page. */
export function nodeFileBare(node: string): string {
	return nodeFile(node).split('\n').filter((line) => !line.startsWith('#')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** The value of {@code key} in a node's file, or undefined where the node does not set it. */
export function prop(node: string, key: string): string | undefined {
	return nodeFile(node).match(new RegExp(`^${key.replace(/\./g, '\\.')}=(.*)$`, 'm'))?.[1];
}
