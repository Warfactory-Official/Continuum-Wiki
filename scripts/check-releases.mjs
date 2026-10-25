// Whether Golem Core or NTM - Continuum has a newer GitHub release, or GemRender newer CurseForge files, than the deployed
// template generator was built with (the live site's generator/releases.json). Writes changed=true|false to
// $GITHUB_OUTPUT. When a source cannot be read it says false and leaves the daily build to it.
import fs from 'node:fs';
import { PROJECTS, latest } from './templates.mjs';

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
		let now;
		try {
			now = await latest(key);
		} catch (e) {
			console.log(`${key}: ${e.message}; not deciding on this check`);
			return false;
		}
		const was = live?.[key];
		const same = was && was.source === now.source && was.version === now.version
			&& JSON.stringify(was.files) === JSON.stringify(now.files) && Boolean(was.harnessMissing) === Boolean(now.harnessMissing);
		if (!same) {
			reason ??= `${key} ${was?.version ?? 'unknown'} -> ${now.version}`;
		}
	}
	console.log(reason ? `changed: ${reason}` : 'no new releases');
	return reason !== null;
}

const result = await changed();
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${result}\n`);
