const ewm = require('electron-wix-msi');
const path = require('path')

const rootPath = path.join(process.cwd())
const outPath = path.join(rootPath, 'dist')
require('pkginfo')(module, 'version');
var stoxVersion = module.exports.version;

const start = async function() {
  const msiCreator = new ewm.MSICreator({
    appDirectory: path.join(outPath, 'StoX-win32-x64'),
    description: 'StoX: An open source software for marine survey analyses',
    exe: 'StoX',
    name: 'StoX',
    arch: 'x64',
    manufacturer: 'Institute of Marine Research, Norway',
    version: stoxVersion,
    outputDirectory: path.join(outPath, 'installers'),
    appIconPath: path.join(rootPath, 'assets', 'stox_icon.ico')
  });
  const supportBinaries = await msiCreator.create();

  //supportBinaries.forEach(async (binary) => {
  //  await signFile(binary);
  //});

  await msiCreator.compile();
}

start();