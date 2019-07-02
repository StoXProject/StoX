import * as msi from 'electron-wix-msi';
import * as path from 'path';

// Step 1: Instantiate the MSICreator
const msiCreator = new msi.MSICreator({
	appDirectory: path.resolve('dist/stox-win32-x64/'), // result from electron-builder
	description: 'StoX',
	exe: 'stox',
	name: 'StoX',
	manufacturer: 'HI institute',
	version: '1.0.0',
	signWithParams: 'sign /a',
	//language: 1033,
	//arch: 'x86',
	outputDirectory: path.resolve('dist/msi/')
});

async function createMsi() {
	// Step 2: Create a .wxs template file
	await msiCreator.create();

	// Step 3: Compile the template to a .msi file
	await msiCreator.compile();
}
console.log('Invoke MSI Builder');
createMsi();
