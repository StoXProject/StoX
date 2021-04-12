const ewm = require('electron-wix-msi');
const path = require('path')

const rootPath = path.join(process.cwd())
const outPath = path.join(rootPath, 'dist')
require('pkginfo')(module, 'name', 'productName', 'version', 'description');
var stoxVersion = module.exports.version;
var nameAndVersion = module.exports.productName + " " + stoxVersion;

const getUuid = require('uuid-by-string')

const u = getUuid(nameAndVersion)

const start = async function () {
  const msiCreator = new ewm.MSICreator({
    appDirectory: path.join(outPath, 'StoX-win32-x64'),
    description: module.exports.description,
    exe: module.exports.productName,
    name: module.exports.productName,
    upgradeCode: getUuid(nameAndVersion),
    arch: 'x64',
    manufacturer: 'Institute of Marine Research, Norway',
    version: stoxVersion,
    outputDirectory: path.join(outPath, 'installers'),
    appIconPath: path.join(rootPath, 'assets', 'stox_icon.ico'),
    shortcutName: nameAndVersion,
    shortcutFolderName: module.exports.productName,
    programFilesFolderName: nameAndVersion,
    ui: { enabled: true, chooseDirectory: true }
  });
  const supportBinaries = await msiCreator.create();

  //supportBinaries.forEach(async (binary) => {
  //  await signFile(binary);
  //});

  await msiCreator.compile();
}

start();