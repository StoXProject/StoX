//import { start } from "repl";
//import { platform } from "os";
import { Utils, UtilsConstants } from "./utils/util";
//import { resolve } from "path";

import path from 'path';
//handle setupevents as quickly as possible
const setupEvents = require('./../installers/setupEvents')
var mainWindow: any;

// local constants
module Constants {
  export const RES_PATH = 'srv';
}

// global variables
// var projectRootPath: string;
// var projectPath: string;
// var rPath: string;
// var rStoxFtpPath: string;



var simpleNodeLogger = require('simple-node-logger');
var express = require('express');
var bodyParser = require('body-parser');
var child_process = require('child_process');
var fs = require('fs')
var cors = require('cors');
var callr_evaluate: boolean[] = [];
var rPackagesIsInstalling = false;
var isClosing = false;

const net = require("net")
let client: any = null;


let useOpenCPU: boolean = false;

//let rserve_client: any = null;

var properties: any = null;
var activeProjectSaved: boolean = true;
var log: any = null;
var server: any = null;
var rAvailable: boolean = false;
let serverStarted = false;
var versionRstoxFramework = "";
var loadStatusRstoxFramework = "";
var officialRstoxPackages: String[] = [];
var versionR = "";
//var rspawn: any;
var backendProcess: any; // Backend process
require('pkginfo')(module, 'version');
var stoxVersion = module.exports.version;
var isOfficialStoXVersion: boolean = false;
var isCertifiedRstoxFramework: boolean = false;
var RstoxPackageStatus: number;

//var officialRstoxFrameworkVersion = "1.2.27" // used to show red when official (ending with 0) but not the right official
//var supportedRstoxFrameworkVersions : string[] = ""; 
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

app.on('ready', async () => {
  if (setupEvents.handleSquirrelEvent()) {
    return;
  }

  logInfo("> stox version: "  + stoxVersion);
  setupLogger();
  logInfo("> lifecycle: ready")
  setupServer();
  await startNodeServer();
  readPropertiesFromFile();
  // Extract resurces
  Utils.extractResourceFile(UtilsConstants.RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS, "stox");
  //Utils.extractResourceFile(UtilsConstants.RES_SERVER_VERSIONS);
  Utils.extractResourceFile(UtilsConstants.RES_SERVER_FILENAME, "stox");
  
  await startBackendServer(true);
  await checkLoadStatusRstoxFramework();
  createWindow()
})

/*// Quit when all windows are closed. // AS added Break the OS convention and close the process when window closes
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})*/

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('quit', function () {
  // Write app properties file to disc here.
  logInfo('ev:app quit');
  writePropertiesToFile();
});

function logInfo(str: string) {
  if (log != null) {
    log.info(str);
  }
  console.log(str);
}

function logError(str: string) {
  log.log('error', str);
  console.log(str);
}

function setupLogger() {
  var logDir = require('temp-dir') + "/stox";
  console.log("Logging to " + logDir);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const opts = {
    errorEventName: 'error',
    logDirectory: logDir, // NOTE: folder must exist and be writable... executable bin directory
    fileNamePattern: 'node-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
  };
  log = simpleNodeLogger.createRollingFileLogger(opts);
}

async function startNodeServer() {
  // start server
  var port = 3000;
  logInfo("> Starting Node Server at port " + port + "...");
  await new Promise(r => {
    server.listen(port, () => {
      logInfo('Node Server started at http://localhost:' + port);
      r(null)
    });
  });

}

function createWindow() {
  if (process.argv.filter(arg => arg == '--server').length > 0) {
    logInfo('No window created due to --server flag');
    return;
  }
  logInfo('creating window');
  app.allowRendererProcessReuse = true; // required or forced by electron 9

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'StoX 3.0',
    webPreferences: {
      nodeIntegration: true
    }
  })
  if (mainWindow == null) {
    return;
  }
  // mainWindow.setMenu(null);
  //createMenu();
  Menu.setApplicationMenu(null)

  // and load the index.html of the app.
  //mainWindow.loadFile(`../frontend/dist/stox/index.html`)
  logInfo(`log to file://${__dirname}/`)
  mainWindow.loadURL(`file://${__dirname}/../frontend/dist/stox/index.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // Emitted when the window is closed.
  mainWindow.on('close', async (e: any) => {
    await onClosed(e)
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    // rspawn = null;
    child_process = null;
  })

}
function showElectronMessageBox(title: string, message: string, buttons: string[]): number {
  return require('electron').dialog.showMessageBoxSync(null,
    {
      type: 'question',
      buttons: buttons,
      title: title,
      message: message
    });
}

async function onClosed(e: any) {
  if (properties != null && properties.activeProject !== null && !isClosing) {
    logInfo('close - saved:' + activeProjectSaved + ' project: ' + (properties != null && properties.activeProject != null ? properties.activeProject : ''))
    // need to stop application from quitting to let Promise work, and then re-close. with properties.activeProject = null
    e.preventDefault();
    let save = false;
    if (!activeProjectSaved) {
      var choice = showElectronMessageBox('Save project', 'Save changes to project before closing?', ['Yes', 'No', 'Cancel']);
      if (choice == 0) {
        save = true;
      }
      if (choice == 2) { // cancel
        return;
      }
    }
    let cmd = "RstoxFramework::runFunction.JSON(" + JSON.stringify(JSON.stringify({
      what: "closeProject",
      args: JSON.stringify({ projectPath: properties.activeProject, save: save }),
      package: "RstoxFramework"
    })) + ")";
    let s = await callR(cmd);
    isClosing = true;
    mainWindow.close(); // re-close
  }
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const createMenu = function createMenu() {
  // Read app properties file from disc here.
  logInfo('ev:ready');

  const template = [
    // { role: 'appMenu' }
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    }, {
      label: "Edit",
      submenu: [
        /*{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },*/
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    // { role: 'editMenu' }

    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...([
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'StoX home',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('http://www.imr.no/forskning/prosjekter/stox/')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function rScriptBin() {
  return (properties.rPath == "" || properties.rPath == null ? "" : properties.rPath + "/") + "Rscript";
}

async function checkRAvailable(): Promise<boolean> {
  var rscriptBin = rScriptBin();
  logInfo('Rscript bin ' + rscriptBin);
  let p1 = child_process.spawnSync(rscriptBin, ["--no-environ", "-e", "TRUE"]);
  logInfo('Check Rscript availability ' + p1.stdout);

  if (p1.stdout == null || !p1.stdout.includes("TRUE")) {
    rAvailable = false;
    logInfo('Rscript is not available. Set R path in the properties."');
    return false;
  }
  logInfo('Rscript is available.');
  return true;
}

async function startBackendServer(checkLoadStatus : boolean): Promise<string> {
  logInfo('Starting backend');

  rAvailable = await checkRAvailable();
  if (!rAvailable) {
    logInfo('R is not available- quitting startBackendServer');
    return "";
  }
  var rscriptBin = rScriptBin();

  // spawn a process instead of exec (this will not include a intermediate hidden shell process cmd)
  let fileName = Utils.getTempResFileName(UtilsConstants.RES_SERVER_FILENAME, "stox")
  logInfo("> Spawning " + rscriptBin + " " + fileName);
  backendProcess = await child_process.spawn(rscriptBin, [fileName], { stdio: ['pipe', 'ignore', 'ignore'] });
  backendProcess.on('error', (er: any) => {
    logInfo("> Spawning error " + er);
  });
  // console.log("Process " + backendProcess.pid + " started with " + serverCmd)
  logInfo("> Backend started.");
  //console.log(backendProcess.pid);
  //rserve_client = await connectRserve(rserve);
  await createClient();

  if (serverStarted) {

    let cmd = "paste(R.Version()$major, gsub(\"(.+?)([.].*)\", \"\\\\1\", R.Version()$minor), sep = \".\")"
    versionR = (await callR(cmd) as any).result;
    logInfo("> R version " + versionR);
    
    let firstLibPath = (await callR(".libPaths()") as any).result;
    logInfo("> First of .libPaths: " + firstLibPath);
    


    await callR("# Check that we are on Windows:\nif (.Platform$OS.type == \"windows\") {\n\t# If no non-programfiles libraries, create the same that Rstudio creates:\n\tlib <- .libPaths()\n\twritable <- file.access(lib, mode = 2) == 0\n\tif(!writable[1]) {\n\t\thomeFolder <- utils::readRegistry(key=\"Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Explorer\\\\Shell Folders\", hive=\"HCU\")$Personal\n\t\t# As of R 4.2.0 the folder for the packages changed:\n\t\ttwoDigitRVersion <- paste(R.Version()$major, strsplit(R.Version()$minor, \".\", fixed = TRUE)[[1L]][1L], sep = \".\")\n\t\tif(getRversion() >= \"4.2.0\") {\n\t\t\tnewLib <- paste(Sys.getenv(\"USERPROFILE\"), \"AppData\", \"Local\", \"R\", \"win-library\", twoDigitRVersion, sep=\"/\")\n\t\t}\n\t\telse {\n\t\t\tnewLib <- paste(homeFolder, \"R\", \"win-library\", twoDigitRVersion, sep=\"/\")\n\t\t}\n\t\t# Add the local library as the first:\n\t\tif(!dir.exists(newLib)) {\n\t\t\tdir.create(newLib, recursive = TRUE)\n\t\t}\n\t\t# Add the local library in this session:\n\t\t.libPaths(newLib)\n\t}\n}")
    
    logInfo("> R packages installed in: " + (await callR(".libPaths()[1]") as any).result);



    let officialsRFTmpFile = Utils.getTempResFileName(UtilsConstants.RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS, "stox");
    //let versionsTmpFile = Utils.getTempResFileName(UtilsConstants.RES_SERVER_VERSIONS);
    //logInfo(versionsTmpFile);
    //let StoXGUIInternalFile = 'srv/StoXGUIInternal_0.1.tar.gz';
    //let StoXGUIInternalFile = path.join(path.join(__dirname, "../.."), 'srv/StoXGUIInternal_0.1.tar.gz')
    //let StoXGUIInternalFile = Utils.getTempResFileName(UtilsConstants.RES_SERVER_STOXGUIINTERNAL);
    //let StoXGUIInternalFile = path.join(path.join(__dirname, ".."), Constants.RES_PATH, UtilsConstants.RES_SERVER_STOXGUIINTERNAL);
    let StoXGUIInternalFolder = Utils.getTempResFileName("StoXGUIInternal", "stox")
    logInfo(StoXGUIInternalFolder);
    StoXGUIInternalFolder = StoXGUIInternalFolder.replace(/\\/g, "/"); // convert backslash to forward
    logInfo(StoXGUIInternalFolder);
    
    
    
    /*cmd = "paste(.libPaths(), collapse=\",\")";
    versionR = (await callR(cmd) as any).result;
    logInfo("> Lib paths " + versionR);*/
    
    //cmd = "if(!suppressWarnings(require(RCurl, quietly = TRUE))) install.packages(\"RCurl\", quiet = TRUE, repos = \"https://cloud.r-project.org\")";
    //logInfo(cmd);
    //let res22 = (await callR(cmd) as any).result;
    
    // With R 4.3.0 the source() no longer works with callR. It simplly froze. Building a package instead:
    // cmd = "source(\"" + versionsTmpFile + "\")";
    // logInfo(cmd);
    // let res = (await callR(cmd) as any).result;

    // Install StoXGUIInternal every time for safety:
    // Create the pakcage:
    Utils.createStoXGUIInternal();
    //cmd = "if(!require(StoXGUIInternal, quietly = TRUE)) utils::install.packages(\"" + StoXGUIInternalFile + "\", repos = NULL, type = \"source\", lib = .libPaths()[1])";
    cmd = "utils::install.packages(\"" + StoXGUIInternalFolder + "\", repos = NULL, type = \"source\", lib = .libPaths()[1])";
    logInfo(cmd);
    let res = (await callR(cmd) as any).result;
    logInfo(res);

    
    // Initiate a local library
    //logInfo("> libPaths before initiation" + (await callR(".libPaths()[1]") as any).result);
    //logInfo("> StoXGUIInternal::initLocalLibrary(): " + (await callR("StoXGUIInternal::initLocalLibrary()") as any).result);



    
    // Test whether RstoxFramework is installed:
    if(checkLoadStatus) {
      await checkLoadStatusRstoxFramework();
      if (loadStatusRstoxFramework != "") {
        return "";
      }
    }
    
    
    
    // This vector holds the PackageName_PackageVersion of all installed Rstox packages that are listed in the officialsRFTmpFile.
    // The vector is however only used as a list of package names, when checking the status of the packages in the
    // server.get('/getRstoxPackageVersions'...
    // below on line 800-ish:
    cmd = "StoXGUIInternal::getOfficialRstoxPackageVersion(\"" + stoxVersion + "\", \"" + officialsRFTmpFile + "\", optionalDependencies = TRUE, toJSON = T)";
    logInfo(cmd);
    officialRstoxPackages = JSON.parse((await callR(cmd) as any).result);
    logInfo(JSON.stringify(officialRstoxPackages));
    
    
    cmd = "tryCatch(paste0(\"RstoxFramework_\", as.character(packageVersion(\"RstoxFramework\"))),error = function(e) {\"\"})"
    versionRstoxFramework = (await callR(cmd) as any).result;
    logInfo(versionRstoxFramework);

    cmd = "RstoxFramework::isOfficialStoXVersion(\"" + stoxVersion + "\", \"" + officialsRFTmpFile + "\")";
    isOfficialStoXVersion = (await callR(cmd) as any).result == "TRUE";
    
    cmd = "RstoxFramework::isCertifiedRstoxFramework(\"" + stoxVersion + "\", \"" + officialsRFTmpFile + "\", optionalDependencies = TRUE)";
    isCertifiedRstoxFramework = (await callR(cmd) as any).result == "TRUE";
    
    
  }
 
  return "ok";
}

async function checkLoadStatusRstoxFramework() : Promise<string> {
  if(!rAvailable) {
    return ""
  }
  let cmd = "tryCatch({library(\"RstoxFramework\"); \"\"} ,error = function(e) {e})"
  loadStatusRstoxFramework = (await callR(cmd) as any).result.trim();
  logInfo("> Load status RstoxFramework: " + loadStatusRstoxFramework);
  return "ok";
}



async function getPackageStatus(packageName: string, stoxVersion: string, officialsRFTmpFile: string) {
  let cmd = "StoXGUIInternal::RstoxPackageStatus(\"" + packageName + "\", \"" + stoxVersion + "\", \"" + officialsRFTmpFile + "\")";
  console.log(cmd)
  RstoxPackageStatus = await (callR(cmd) as any);
  console.log(RstoxPackageStatus)
  return RstoxPackageStatus;
}


async function getVersionStringOfPackage(packageName: string) {
  // 2023-04-25 (Work to separate the GUI from the Versions.R in RstoxFramework): Changed this to use utils directly, since the getVersionStringOfPackage is used in RstoxFramework:
  //let cmd = "StoXGUIInternal::getVersionStringOfPackage(\"" + packageName + "\")";
  let cmd = "utils::installed.packages()[, \"Version\"][\"" + packageName + "\"]";
  return await (callR(cmd) as any);
}





/**
 * Create a safe connection to socket with timeout loop. Either success or failure in each try.
 */
async function createClient() {
  while (callr_evaluate.length > 0) {
    // pause when client is busy. 
    await new Promise(r => setTimeout(() => { r(null); }, 50/*ms*/));
  }
  if (client != null) {
    logInfo('Close existing client');
    client.destroy();
    logInfo('Client closed');
  }
  logInfo('Create client socket');
  client = null;//new net.Socket();  
  for (let i = 1; i <= 10000; i++) {
    await new Promise(r => setTimeout(() => { r(null); }, 400/*ms*/)); // createConnection synchr. takes however 1 sec.
    logInfo("> Connecting to " + "localhost" + ":" + 6312 + " try " + i);
    serverStarted = false;
    await new Promise(resolve => {
      client = new net.createConnection(6312, "localhost")
        .on('connect', function () {
          serverStarted = true;
          logInfo("> Connected in try " + i);
          resolve(null);
        }).on('error', function (err: any) {
          logInfo("> Error connecting client: " + err);
          resolve(null);
        });
    });
    if (serverStarted) {
      break;
    }
  }
  if (client != null) {
    client.on('data', function (data: any) {
      if (client.handle != null) {
        client.handle(data);
      }
    });
    client.setEncoding("utf8"); // to get chunks read as strings
    return "";
  };
}



/*function isRunning(win: string, mac: string, linux: string) {
  return new Promise(function (resolve, reject) {
    const plat = process.platform
    const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
    const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
    if (cmd === '' || proc === '') {
      resolve(false)
    }
    child_process.exec(cmd, function (err: any, stdout: any, stderr: any) {
      resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
    })
  })
}*/
const getPropertiesFileName = function getPropertiesFileName() {
  return require('os').homedir() + "/.stox.properties." + stoxVersion + ".json";
}

const readPropertiesFromFile = function readPropertiesFromFile() {
  let propFileName =getPropertiesFileName();
  try {
    if (fs.existsSync(propFileName)) {
      try {
        properties = JSON.parse(fs.readFileSync(propFileName, { encoding: 'utf-8', flag: 'r' }));
      } catch (err) {
        properties = null;
        logInfo("> Properties not read due to error " + err);
      }
      logInfo("> Properties read from file: " + propFileName);
    }
    if (properties == null) {
      // Properties not read properly from file, or the file doesnt exist.
      logInfo("> create initial properties")
      properties = {
        "projectRootPath": "",
        "activeProject": "",
        "rPath": "",
        "rStoxFtpPath": ""
      };
      logInfo("> Properties initialized.");
    }
    if (properties.projectRootPath == null || properties.projectRootPath == "") {
      console.log("Electron Home: " + app.getPath('home'));
      console.log("Node Home: " + require('os').homedir());
      properties.projectRootPath = app.getPath('home');//require('os').homedir()
    }
    if(properties.mapInfo == null) {
      properties.mapInfo = {projection:'StoX_001_LAEA',zoom:4.3,origin:[10.01,60.01]}
      //{projection:'StoX_001_LAEA', zoom:4.3, origin:[10,60]}
    }
  } catch (err) {
    logInfo("> Error reading properties: " + err);
  }
}

const writePropertiesToFile = function writePropertiesToFile() {
  if (properties == null) {
    return; // Prevent properties to be reset.
  }
  let resourcefile = getPropertiesFileName();
  try {
    let options = { encoding: 'utf-8', flag: 'w' };
    /*if (properties.projectRootPath) {
      properties.projectRootPath = require('os').homedir();
    */
    let str = JSON.stringify(properties, null, 2);
    //logInfo("> jsonString : " + jsonString);
    fs.writeFileSync(resourcefile, str, options)
  } catch (err) {
    logInfo("> Error writing properties " + err);
  }
}

function callR(arg: string) {
  const startTime = process.hrtime();
  return new Promise(async (resolve) => {
    while (callr_evaluate.length > 0) {
      // pause when client is busy. 
      await new Promise(r => setTimeout(() => { r(null); }, 50/*ms*/));
    }
    callr_evaluate.push(true); // make my self ready. lock the other calls out if they appear at same time.
    while (callr_evaluate.length > 1) {
      // pause if 2 calls are released asynchronously from the first pause. (it could maybe happen) only one at the time.
      await new Promise(r => setTimeout(() => { r(null); }, 50/*ms*/));
    }
    let ans: any = await evaluate(client, arg);

    callr_evaluate.splice(callr_evaluate.length - 1, 1);
    //let resparsed = JSON.parse(ans);
    let diff = process.hrtime(startTime);
    resolve({ time: diff[0] + diff[1] / 1000000000, result: ans });
  });
}


async function evaluate(client: any, cmd: string) {
  if (client == null) {
    logInfo("> client=NULL: " + cmd)
    return null;
  }

  //console.log("evaluate: " + cmd);
  let s = Buffer.from(cmd, 'utf8').toString('hex'); // Encode command as hex
  let lens = "" + s.length;
  await new Promise(async resolve => {
    client.handle = (data: any) => {
      if (data == lens) {
        // The length is send forth and back, we an proceed
        resolve(null);
        //console.log("length received: " + data);
      } /*else {
        console.log("length error: " + data);
      }*/
    };
    //console.log("write length: " + lens);
    await client.write("" + s.length);

  });
  let nResp = 0;
  await new Promise(async resolve => {
    client.handle = (data: any) => {
      nResp = Number(data);
      if (nResp != null) {
        // recevied response length 
        resolve(null);
        //console.log("write data nChar = " + nResp);
      } /*else {
        console.log("write data error nChar = null");
      }*/
    };
    //console.log("write cmd hex: " + s);
    await client.write(s); // may lead to throttling on the server side, but the server uses length info to get the string
  });
  // Total buffered preallocated before throttling, to avoid dynamic allocation time loss
  let buf = Buffer.alloc(nResp);
  let bufLen = 0;
  let nChunks = 0;
  await new Promise(async resolve => {
    // calling handler from socket data event, registered once upon connection
    client.handle = (data: any) => {
      // Writing chunks (throttling) into total buffer
      buf.write(data, bufLen);
      bufLen = bufLen + data.length;
      nChunks++;
      if (bufLen == nResp) { // test on length
        // The response is received - finish
        //console.log("throttling bufLen == nResp " + bufLen);
        resolve(null);
      } /*else if(bufLen < nResp) {
        console.log("throttling bufLen, nResp " + bufLen + "," + nResp);
      } else {
        console.log("throttling overflow error bufLen=" + bufLen, ", nResp=" + nResp);
      }*/
    };
    //console.log("write response length " + nResp);
    await client.write("" + nResp); // handshake response length
  });
  return Buffer.from(buf.toString(), 'hex').toString("utf8");
}


function setupServer() {
  server = express();
  //server.use(bodyParser.json())
  server.use(bodyParser.text())
  //server.use('/static', express.static('srv'))
  server.use(cors()) // enable cors in header (http call from static resources)
  //server.options(cors());

  // Global content-type handler for all responses. text/plain is trusted by cors
  server.use(function (req: any, res: any, next: any) {
    res.type('text/plain');
    next();
  });

  server.post('/updateactiveproject', function (req: any, res: any) {
    properties.activeProject = req.body;
    properties.projectRootPath = require("path").resolve(properties.activeProject, "..")
    logInfo("> update active project: " + properties.activeProject)
    res.send("ok");
  });
  server.post('/updateactiveprojectsavedstatus', function (req: any, res: any) {
    activeProjectSaved = req.body === "true";
    logInfo("> update active project saved status: " + activeProjectSaved)
    res.send("ok");
  });

  server.get('/readactiveproject', function (req: any, res: any) {
    logInfo("> read active project: " + properties.activeProject)
    res.send(properties.activeProject);
  });

  server.post('/updateprojectrootpath', function (req: any, res: any) {
    let projectRootPath = req.body;
    //logInfo("> in updateprojectrootpath jsonString : " + jsonString);
    properties.projectRootPath = projectRootPath;
    res.send("project root path updated");
  });
  // modify rpath in backend
  server.post('/rpath', async (req: any, res: any) => {
    properties.rPath = req.body;
    logInfo('set rpath ' + properties.rPath);
    let resultstr: string = await startBackendServer(true);
    res.send('post /rpath result:' + resultstr);
  });
  server.post('/mapInfo', async (req: any, res: any) => {
    properties.mapInfo = JSON.parse(req.body);
    //logInfo('set mapInfo ' + properties.mapInfo);
    res.send('mapInfo updated');
  });
  // observe project root path
  server.get('/projectrootpath', function (req: any, res: any) {
    //logInfo('get project root path ' + properties.projectRootPath);
    res.send(properties.projectRootPath);
  });
  // observe rpath in backend
  server.get('/', function (req: any, res: any) {
    //logInfo('get rpath ' + properties.rPath);
    res.send("Node server started");
  });
  // observe rpath in backend
  server.get('/rpath', function (req: any, res: any) {
    logInfo('get rpath ' + properties.rPath);
    res.send(properties.rPath);
  });

  server.get('/mapInfo', function (req: any, res: any) {
    logInfo('get mapInfo ' + properties.mapInfo);
    res.send(properties.mapInfo);
  });

  server.get('/stoxversion', function (req: any, res: any) {
    res.send(stoxVersion);
  });

  // observe rpath in backend
  server.post('/callR', async (req: any, res: any) => {
    while (rPackagesIsInstalling) {
      // pause when installing packages
      await new Promise(r => setTimeout(() => { r(null); }, 50/*ms*/));
    }
    if (client == null || !rAvailable) {
      res.send({ value: null, message: [], warning: [], error: ['R is not available. Set path to R bin in Tools->R connection.'] });
      return;
    }
    if (versionRstoxFramework == "") {
      res.send({ value: null, message: [], warning: [], error: ['RstoxFramework is not installed. Install from Tools->Install R packages.'] });
      return;
    }
    if (loadStatusRstoxFramework != "") {
      res.send({ value: null, message: [], warning: [], error: ['RstoxFramework is not loaded properly due to message:\n\"' + loadStatusRstoxFramework + '\". \nTry to reinstall from Tools->Install R packages. (Remember also to close other R applications first)'] });
      return;
    }
    // console.log("cmd: \"" + s.replace(/"/g, '\\"') + "\"");
    //logInfo(req.body);
    // this is a timout for a specific route for node express server.
    // This will make long r calls like bootstrapping work.
    req.setTimeout(2073600000); // use 24days proxy timeout.

    let cmd: string = "RstoxFramework::runFunction.JSON(" + JSON.stringify(req.body) + ")";
    //cmd = cmd.replace(/\"/g, "\\\"");
    //logInfo("> cmd:" + cmd)
    // The server is parsing the expression, a need for stringify to have 2^n-1 escapes where n is 
    // starting at 1 and going to 2 (because of parse). stringify and parse operates oppocite ways.
    // The args in the body is already stringified (because of need to do do.call)
    //cmd = JSON.stringify(cmd);
    let s: any = await callR(cmd);
    //logInfo('call R result ' + JSON.stringify(s));
    // res.type('text/plain');
    res.send(s.result);
  });

  server.post('/installRstoxFramework', async (req: any, res: any) => {
    try {
      let s : string = "R is not available";
      rPackagesIsInstalling = true;
      logInfo('/installRstoxFramework');

      // Install remotes and data.table.
      let cmd = "if(!suppressWarnings(require(remotes, quietly = TRUE))) install.packages(\"remotes\", type = \"binary\", quiet = TRUE, repos = \"https://cloud.r-project.org\")";
      logInfo(cmd);
      let res11 = (await callR(cmd) as any).result;
      cmd = "if(!suppressWarnings(require(data.table, quietly = TRUE))) install.packages(\"data.table\", type = \"binary\", quiet = TRUE, repos = \"https://cloud.r-project.org\")";
      logInfo(cmd);
      let res12 = (await callR(cmd) as any).result;
    

      await startBackendServer(false);
      logInfo('server started: ' + serverStarted + ", client: " + client);
      if (serverStarted) {
        let officialsRFTmpFile = Utils.getTempResFileName(UtilsConstants.RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS, "stox");
        let cmd = "StoXGUIInternal::installOfficialRstoxPackagesWithDependencies(\"" + stoxVersion + "\", \"" +
          officialsRFTmpFile + "\", quiet = TRUE, toJSON = TRUE)";
        logInfo(cmd);
        let res = (await callR(cmd) as any).result;
        // Build a string naming the packages that were installed, or an error message:
        if(res.startsWith('Error')) {
          s = res;
        }
        else {
          s = "Installed packages: " + res;
        }
        
        await checkLoadStatusRstoxFramework();
        logInfo(s);
      }
      res.send(s);
    } finally {
      rPackagesIsInstalling = false;
    }
  });

  server.get('/getRstoxPackageVersions', async (req: any, res: any) => {
    let packages: {
      packageName: string;
      version: string;
      status: number;
    }[] = [];
    if (serverStarted) {
      // logInfo("> iterating through officialRstoxPackages " + officialRstoxPackages);
      let officialsRFTmpFile = Utils.getTempResFileName(UtilsConstants.RES_SERVER_OFFICIALRSTOXFRAMEWORKVERSIONS, "stox");
      let packagesStatus = officialRstoxPackages.map(async s => {
        let elms: string[] = s.split("_");
        // Determine status of each official package
        let thisStatus = (await getPackageStatus(elms[0], stoxVersion, officialsRFTmpFile) as any).result

        let version = (await getVersionStringOfPackage(elms[0]) as any).result  

        return { packageName: elms[0], version: thisStatus == "3" ? " not installed" : version, status: thisStatus };
      });
      packages = await Promise.all(packagesStatus);
    } else {
      packages.push({ packageName: "R disconnected", version: "", status: 3 });
    }
    // logInfo(JSON.stringify(packages));
    res.send(packages);

  });

  server.get('/getIsOfficialStoXVersion', function (req: any, res: any) {
   res.send(isOfficialStoXVersion);
   });

   server.get('/getIsCertifiedRstoxFramework', function (req: any, res: any) {
    res.send(isCertifiedRstoxFramework);
   });
  
  
  function resolveDefaultPath(defPath: string): string {
    // electron showOpenDialog defaultPath requires c:\\temp\\test on win32, otherwise c:/temp/test on mac/linux
    return defPath == null ? require('os').homedir() : process.platform == "win32" ? defPath.replace(/\//g, "\\") : defPath.replace(/\\/g, "/");
  }

  server.post('/browse', function (req: any, res: any) {
    logInfo("> select a folder... wait");
    let defPath = resolveDefaultPath(req.body); // correct slashes in default path
    logInfo("> default folder " + defPath);
    require('electron').dialog.showOpenDialog(mainWindow != null ? mainWindow : null, {
      title: 'Select a folder', defaultPath: /*require('os').homedir()*/ defPath,
      properties: [/*'openFile'*/'openDirectory']
    }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
      if (!object.filePaths || !object.filePaths.length) {
        logInfo("> You didn't select a folder");
        return;
      }
      logInfo("> You did select a folder");
      logInfo(object.filePaths[0]);
      res.send(object.filePaths[0]);
    });
  });

  server.post('/browsePath', function (req: any, res: any) {
    logInfo("> select a file/folder path(s)");
    let options: any = JSON.parse(req.body);
    if (Object.keys(options).length) {
      let defPath = resolveDefaultPath(options.defaultPath); // correct slashes in default path
      logInfo("> default folder " + defPath);
      require('electron').dialog.showOpenDialog(mainWindow != null ? mainWindow : null, {
        title: options.title, defaultPath: defPath,
        properties: options.properties
      }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
        if (!object.filePaths || !object.filePaths.length) {
          logInfo("> You didn't select anything");
          return;
        }

        logInfo("> You selected : " + object.filePaths);

        res.send(object.filePaths);
      });
    }
  });

  server.post('/showinfolder', function (req: any, res: any) {
    logInfo("> show in folder");
    let path = resolveDefaultPath(req.body); // correct slashes in default path
    const openExplorer = require('open-file-explorer');
    openExplorer(path, (err: any) => {
      if(err) {
          console.log(err);
      }
      else {
          //Do Something
      }
    });
  });

  server.post('/readFileAsBase64', async (req: any, res: any) => {
    // read binary data
    // convert binary data to base64 encoded string
    let filePath: string = req.body;
    if (filePath.length > 0 && fs.existsSync(filePath)) {
      var bitmap = fs.readFileSync(req.body);
      const p = require('png-dpi-reader-writer')
      const {width, height, dpi} = p.parsePngFormat(bitmap)
      // calculate in cm
      let widthcm = width / dpi * 2.54;
      let heightcm = height / dpi * 2.54;
      console.log(width, height, dpi);
      res.send({'img': Buffer.from(bitmap).toString('base64'), 
      'width': widthcm, 'height': heightcm});
    } else {
      res.send("error - file doesnt exist");
    }
  });



  server.post('/fileExists', function (req: any, res: any) {
    logInfo("> check if a file exists");

    let filePath: string = req.body;
    if (filePath.length > 0 && fs.existsSync(filePath)) {
      res.send("true");
    } else {
      res.send("false");
    }
  });

  server.post('/openUrl', function (req: any, res: any) {
    let url: string = req.body;
    logInfo("> open url: " + url);
    if (url.length > 0) {
      try {
        require('electron').shell.openExternal(url);
        res.send("url opened: " + url);
      } catch (error) {
        res.send(error);
      }
    }
  });

  server.get('/rAvailable', async (req: any, res: any) => {
    // logInfo("> check if r is available");
    res.send(rAvailable);
  });
  /*server.get('/rstoxFrameworkAvailable', async (req: any, res: any) => {
    //logInfo("> check if rstoxframework is available");
    res.send(rAvailable && versionRstoxFramework != "");
  });*/



  server.post('/makeDirectory', function (req: any, res: any) {
    logInfo("> make directory");
    var dirPath = req.body;
    if (dirPath.length > 0) {
      try {
        fs.mkdirSync(dirPath);
        res.send("true");
      } catch (error) {
        res.send(error);
      }
    } else {
      res.send("false");
    }
  });

  server.post('/exit', function (req: any, res: any) {
    logInfo("> /exit");
    logInfo(mainWindow);
    if (mainWindow != null) {
      logInfo("> have window");
      mainWindow.close()
      res.send("true");
    }
  });

  server.post('/stoxhome', async function (req: any, res: any) {
    logInfo("> /stoxhome");
    const { shell } = require('electron');
    await shell.openExternal('http://www.imr.no/forskning/prosjekter/stox/');
  });

  server.post('/isdesktop', function (req: any, res: any) {
    res.send(mainWindow != null ? true : false);
  });

  server.post('/toggledevtools', async function (req: any, res: any) {
    logInfo("> /toggledevtools");
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
    res.send("true");
  });
}