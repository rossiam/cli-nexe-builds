import { mkdir } from 'node:fs/promises'

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
