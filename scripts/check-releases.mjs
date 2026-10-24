// Whether CurseForge has newer Golem Core, NTM - Continuum or GemRender files than the deployed template generator
// was built with: compares the newest file per node with the live site's generator/releases.json. Writes
// changed=true|false to $GITHUB_OUTPUT. When CurseForge cannot be read it says false and leaves the daily build to it.
import fs from 'node:fs';
import { PROJECTS, latestFiles } from './templates.mjs';

const LIVE = 'https://warfactory-official.github.io/Continuum-Wiki/generator/releases.json';

async function deployed() {
	try {
		const res = await fetch(LIVE, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
		return res.ok ? await res.json() : null;
	} catch {
		return null; // not deployed yet, or the site is down: build
	}
}

async function changed() {
	const live = await deployed();
	let reason = null;
	for (const key of Object.keys(PROJECTS)) {
		let latest;
		try {
			latest = await latestFiles(key);
		} catch (e) {
			console.log(`${key}: ${e.message}; not deciding on this check`);
			return false;
		}
		const was = live?.[key];
		if (!was || was.source !== 'curseforge' || JSON.stringify(was.files) !== JSON.stringify(latest.files)) {
			reason ??= `${key} ${was?.version ?? 'unknown'} -> ${latest.version}`;
		}
	}
	console.log(reason ? `changed: ${reason}` : 'no new files');
	return reason !== null;
}

const result = await changed();
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result}\n`);
