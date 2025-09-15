import { compile } from 'nexe'

// valid platform values: 'windows' | 'mac' | 'alpine' | 'linux' // NodePlatform in nexe
// valid arch values 'x86' | 'x64' | 'arm' | 'arm64' // NodeArch in nexe

const osByPlatform = {
	darwin: 'mac',
}

const os = osByPlatform[process.platform] ?? process.platform
const arch = process.arch
const version = process.version.substring(1)

const target = `${os}-${arch}-${version}`

// console.log(`building ${version}`)
// console.log(`process.arch = [${process.arch}]`)
// console.log(`process.platform = [${process.platform}]`)
// console.log(`process.title = [${process.title}]`)

// TODO: check if already built like nexe_builds does
if (false) {
	compile({
		input: 'bin/dummy.mjs',
		build: true,
		verbose: true,
		mangle: false,
		output: target,
		python: 'python3',
		// targets: [{ version }],
		targets: [target],
	}).then(() => {
		console.log('build finished')
	})
}
