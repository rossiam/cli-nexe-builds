import { mkdir } from 'node:fs/promises'

import { request } from '@octokit/request'
import { compile } from 'nexe'

// valid platform values: 'windows' | 'mac' | 'alpine' | 'linux' // NodePlatform in nexe
// valid arch values 'x86' | 'x64' | 'arm' | 'arm64' // NodeArch in nexe

const osByPlatform = {
	darwin: 'mac',
	win32: 'windows',
}

const os = osByPlatform[process.platform] ?? process.platform
const arch = process.arch
const version = process.version.substring(1)

const target = `${os}-${arch}-${version}`

console.log(`building ${version}`)
console.log(`process.arch = [${process.arch}]`)
console.log(`process.platform = [${process.platform}]`)
console.log(`target = ${target}`)

mkdir('dist').catch((error) => {
	if (error.code !== 'EEXIST') throw error
})

const owner = 'rossiam'
const repo = 'cli-nexe-builds'

const ghToken = process.env.GH_TOKEN

if (!ghToken) {
	console.error('Did not get github token.')
	process.exit(1)
}

const releases = await request("GET /repos/:owner/:repo/releases", {
	headers: {
		authorization: `token ${ghToken}`,
	},
	owner,
	repo,
})

console.log('RELEASES:')
console.log(releases)

// TODO: check if already built like nexe_builds does
if (false) {
	compile({
		input: 'bin/dummy.mjs',
		build: true,
		verbose: true,
		mangle: false,
		output: `dist/${target}`,
		python: 'python3',
		targets: [target],
	}).then(() => {
		console.log('build finished')
	})
}
