// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import sharedPages from './scripts/shared-pages.mjs';
import markdownPages from './scripts/markdown-pages.mjs';

const SITE = 'https://warfactory-official.github.io';
const BASE = '/Continuum-Wiki';

/** The pages every topic shares, generated from src/shared/ into the topic's folder. */
const sharedGroups = (topic) => [
	{ label: 'Machine recipes', collapsed: true, items: [{ autogenerate: { directory: `${topic}/recipes` } }] },
	{ label: 'Data maps', collapsed: true, items: [{ autogenerate: { directory: `${topic}/data-maps` } }] },
	{ label: 'Fluids, tags and other data', collapsed: true, items: [{ autogenerate: { directory: `${topic}/data` } }] },
	{ label: 'Reference', collapsed: true, items: [{ autogenerate: { directory: `${topic}/reference` } }] },
];

// GitHub Pages serves the project site under /Continuum-Wiki/.
export default defineConfig({
	site: SITE,
	base: BASE,
	integrations: [
		sharedPages(),
		starlight({
			title: 'NTM - Continuum Wiki',
			description:
				"Making datapacks, KubeJS scripts and addon mods for NTM - Continuum, the six-target port of HBM's Nuclear Tech Mod.",
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/Warfactory-Official/NTM-Continuum' },
			],
			editLink: {
				baseUrl: 'https://github.com/Warfactory-Official/Continuum-Wiki/edit/main/',
			},
			customCss: ['./src/styles/custom.css'],
			lastUpdated: true,
			components: {
				PageTitle: './src/components/PageTitle.astro',
			},
			plugins: [
				starlightSidebarTopics([
					{
						label: 'Start here',
						link: '/getting-started/introduction/',
						icon: 'rocket',
						items: [{ label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] }],
					},
					{
						label: 'Datapacks',
						link: '/datapacks/overview/',
						icon: 'document',
						items: [
							{ label: 'Datapacks', items: ['datapacks/overview', 'datapacks/first-datapack'] },
							...sharedGroups('datapacks'),
						],
					},
					{
						label: 'KubeJS',
						link: '/kubejs/setup/',
						icon: 'seti:javascript',
						items: [
							{
								label: 'KubeJS',
								items: [
									'kubejs/setup',
									'kubejs/recipe-scripts',
									'kubejs/hbm-global',
									'kubejs/events',
									'kubejs/startup-registry',
									'kubejs/examples',
									'kubejs/troubleshooting',
								],
							},
							...sharedGroups('kubejs'),
						],
					},
					{
						label: 'Addon mods',
						link: '/addons/overview/',
						icon: 'puzzle',
						items: [
							{
								label: 'Addon mods',
								items: [
									'addons/overview',
									'addons/project-setup',
									'addons/first-addon',
									'addons/mod-entry',
									'addons/registering-content',
									'addons/substitution',
									'addons/recipes-and-data',
									'addons/fluids-and-networks',
									'addons/hooks',
									'addons/registries',
									'addons/java-data-maps',
									'addons/dimensions',
									'addons/scripting-surface',
									'addons/testing',
								],
							},
							...sharedGroups('addons'),
						],
					},
				]),
			],
		}),
		markdownPages({ site: SITE + BASE, base: BASE, title: 'NTM - Continuum Wiki' }),
	],
});
