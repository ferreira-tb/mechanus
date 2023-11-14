import { Octokit } from '@octokit/core';
import config from '../config.json' assert { type: 'json' };
import packageJson from '../package.json' assert { type: 'json' };

try {
	const { version } = packageJson;
	const octokit = new Octokit({ auth: config.GITHUB_TOKEN });
	await octokit.request('POST /repos/{owner}/{repo}/releases', {
		tag_name: `v${version}`,
		name: `v${version}`,
		draft: false,
		prerelease: false,
		generate_release_notes: true,
		owner: 'ferreira-tb',
		repo: 'mechanus',
		headers: {
			'X-GitHub-Api-Version': '2022-11-28',
			accept: 'application/vnd.github+json'
		}
	});
} catch (err) {
	console.error(err);
	process.exit(1);
}
