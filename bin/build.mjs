import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { inspect } from 'node:util'

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

const __dirname = import.meta.dirname
const packageData = JSON.parse(await readFile(path.join(__dirname, '../package.json')))
const releaseVersion = packageData.version

const gitAPIHeaders = {
	authorization: `token ${ghToken}`,
}
const releases = (await request("GET /repos/:owner/:repo/releases", {
	headers: gitAPIHeaders,
	owner,
	repo,
})).data
const release = releases.find(release => release.tag_name === releaseVersion)

// TODO: if there is no release, create one

// console.log('RELEASE:')
// console.log(inspect(release))

const asset = release.assets?.find(asset => asset.name === target)
// console.log('ASSET:')
// console.log(inspect(asset))
const fakeCompile = async (opts) => {
	await writeFile(outputFilename, JSON.stringify(opts))
		.catch(error => {
			console.log('Caught error writing fake file.')
			console.log(error)
		})
}

const outputFilename = path.join(__dirname, `../dist/${target}`)
if (asset) {
	console.log('Found asset already exists; skipping.')
} else {
	console.log(`Building ${outputFilename}.`)
	fakeCompile({
		input: 'bin/dummy.mjs',
		build: true,
		verbose: true,
		mangle: false,
		output: outputFilename,
		python: 'python3',
		targets: [target],
	}).then(async () => {
		console.log('Build finished; uploading asset.')

		const buildFileContents = await readFile(outputFilename)
		console.log(`read file containing ${buildFileContents.length} bytes`)
		await request(
			`POST /repos/:owner/:repo/releases/:release_id/assets?name=:name`,
			{
				baseUrl: "https://uploads.github.com",
				headers: {
					'Content-Type': 'application/x-binary',
					'Content-Length': buildFileContents.length,
					...gitAPIHeaders,
				},
				name: target,
				owner,
				repo,
				release_id: release.id,
				data: buildFileContents,
			},
		)
	})
}
