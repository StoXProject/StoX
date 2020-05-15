import { start } from "repl";
import { platform } from "os";

//handle setupevents as quickly as possible
const setupEvents = require('./../installers/setupEvents')
var mainWindow: any;

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

let useOpenCPU: boolean = false;
let rserve: any = require('rserve-client');
let rserve_client: any = null;

var properties: any = null;
var log: any = null;
var server: any = null;

var rspawn: any;
var backendProcess: any; // Backend process
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

app.on('ready', async () => {
  if (setupEvents.handleSquirrelEvent()) {
    return;
  }
  setupLogger();
  logInfo("lifecycle: ready")
  setupServer();
  readPropertiesFromFile();
  await startBackendServer();
  startNodeServer();
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

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
  if (backendProcess != null) {
    logInfo("Terminating backend process " + backendProcess.pid);
    process.exit(backendProcess.pid);
    if (rserve_client != null) {
      rserve_client.end();
    }
  }
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

function startNodeServer() {
  // start server
  var port = 3000;
  logInfo("Starting Node Server at port " + port + "...");
  server.listen(port);
  logInfo('Node Server started at http://localhost:' + port);
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
  createMenu();

  // and load the index.html of the app.
  //mainWindow.loadFile(`../frontend/dist/stox/index.html`)
  mainWindow.loadURL(`file://${__dirname}/../frontend/dist/stox/index.html`)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    rspawn = null;
    child_process = null;
  })

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
async function connectRserve(rserve: any): Promise<any> {
  console.log("Creating R session");
  return new Promise((resolve) => {
    rserve.connect('localhost', 6311, (err: any, client: any) => {
      console.log("Connected");
      resolve(client);
    });
  })
}

async function startBackendServer(): Promise<string> {
  let backendLibName: string = useOpenCPU ? 'opencpu' : 'Rserve';
  let backendStartServerCmd = backendLibName + "::" + (useOpenCPU ?
    "ocpu_start_server(5307,  preload = c('RstoxAPI', 'data.table', 'rgdal', 'rgeos', 'sp', 'geojsonio', 'jsonlite', 'fst', 'Rcpp', 'xml2', 'readr'), workers = 5" :
    "run.Rserve()");
  logInfo("Running on Platform: " + process.platform)
  if (process.platform == "win32"/*windows*/ || process.platform == "darwin"/*mac*/ || process.platform == "linux") {
    // On linux, sudo is required and backend server lib must be installed separatly. check this
    var rscriptBin = (properties.rPath == "" || properties.rPath == null ? "" : properties.rPath + "/") + "Rscript";
    let p1 = child_process.spawnSync(rscriptBin, ["--no-environ", "-e", "print(TRUE)"]);
    logInfo('Check Rscript availability' + p1.stdout);
    if (p1.error) {
      return p1.error;
    }
    if (p1.stdout == null || !p1.stdout.includes("TRUE")) {
      return "Rscript is not available. Set R path in the properties."
    }
    // Check for backend lib in installed packages
    let p2 = child_process.spawnSync(rscriptBin, ["--no-environ", "-e", "eval('" + backendLibName + "' %in% rownames(installed.packages()))"]);
    if (p2.error) {
      return p2.error;
    }
    if (p2.stdout == null) {
      return "Rscript is not available. Set R path in the properties."
    }
    if (p2.stdout.includes("FALSE") && process.platform != "linux") {
      // Open cpu is not installed
      logInfo("installing " + backendLibName + "...");
      child_process.execSync(rscriptBin + " -e \"install.packages('" + backendLibName + "', repos='http://cran.us.r-project.org')\"");
      logInfo("" + backendLibName + " installed.");
    }
    logInfo("Starting " + backendLibName + " ...");

    // spawn a process instead of exec (this will not include a intermediate hidden shell process cmd)
    backendProcess = child_process.spawn(rscriptBin, ['-e', backendStartServerCmd]);
    backendProcess.on('error', (er: any) => { logInfo(er) });
    logInfo("Process " + backendProcess.pid + " started with " + " -e \"" + backendStartServerCmd + "\"")
    logInfo(backendLibName + " started.");
    if (!useOpenCPU) {
      rserve_client = await connectRserve(rserve);
    }
  }
  return "ok";
}

const readPropertiesFromFile = function readPropertiesFromFile() {
  let propFileName = require('os').homedir() + "/.stox.properties.json";
  try {
    if (fs.existsSync(propFileName)) {
      properties = JSON.parse(fs.readFileSync(propFileName, { encoding: 'utf-8', flag: 'r' }));
      logInfo("Properties read from file: " + propFileName);
    }
    if (properties == null) {
      // Properties not read properly from file, or the file doesnt exist.
      logInfo("create initial properties")
      properties = {
        "projectRootPath": require('os').homedir(),
        "activeProject": "",
        "rPath": "",
        "rStoxFtpPath": ""
      };
      logInfo("Properties initialized.");
    }
  } catch (err) {
    logInfo("Error reading properties: " + err);
  }
}

const writePropertiesToFile = function writePropertiesToFile() {
  if (properties == null) {
    return; // Prevent properties to be reset.
  }
  let resourcefile = require('os').homedir() + "/.stox.properties.json";
  try {
    let options = { encoding: 'utf-8', flag: 'w' };
    /*if (properties.projectRootPath) {
      properties.projectRootPath = require('os').homedir();
    */
    let str = JSON.stringify(properties, null, 2);
    //logInfo("jsonString : " + jsonString);
    fs.writeFileSync(resourcefile, str, options)
  } catch (err) {
    logInfo("Error writing properties " + err);
  }
}

function setupServer() {
  server = express();
  server.use(bodyParser.json())

  server.use(cors()) // enable cors in header (http call from static resources)
  server.options(cors());

  server.post('/updateactiveproject', function (req: any, res: any) {
    properties.activeProject = JSON.parse(req.body.jsonString);
    logInfo("update active project: " + properties.activeProject)
    res.send("ok");
  });

  server.get('/readactiveproject', function (req: any, res: any) {
    logInfo("read active project: " + properties.activeProject)
    res.send(properties.activeProject);
  });

  server.post('/updateprojectrootpath', function (req: any, res: any) {
    let jsonString = req.body.jsonString;
    //logInfo("in updateprojectrootpath jsonString : " + jsonString);
    properties.projectRootPath = JSON.parse(jsonString);
    res.send("project root path updated");
  });
  // modify rpath in backend
  server.post('/rpath', async (req: any, res: any) => {
    properties.rPath = req.body.rpath;
    //logInfo('rpath ' + properties.rPath);
    let resultstr: string = await startBackendServer();
    res.send('post /rpath result:' + resultstr);
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
    //logInfo('get rpath ' + properties.rPath);
    res.send(properties.rPath);
  });
  var callr_evaluate: boolean[] = [];

  function callR(client: any, expr: any) {
    const startTime = process.hrtime();
    return new Promise(async (resolve) => {
      while (callr_evaluate.length > 0) {
        // pause when client is busy. 
        await new Promise(r => setTimeout(() => { r(); }, 50/*ms*/));
      }
      callr_evaluate.push(true); // make my self ready. lock the other calls out if they appear at same time.
      while (callr_evaluate.length > 1) {
        // pause if 2 calls are released asynchronously from the first pause. (it could maybe happen) only one at the time.
        await new Promise(r => setTimeout(() => { r(); }, 50/*ms*/));
      }
      client.evaluate(expr, (err: any, ans: any) => {
        callr_evaluate.splice(callr_evaluate.length - 1, 1);
        //let resparsed = JSON.parse(ans);
        let diff = process.hrtime(startTime);
        resolve({ time: diff[0] + diff[1] / 1000000000, result: ans });
      });
    });
  }

  function callFunction(client: any, what: any, args: any, pkg: any = "RstoxFramework") {
    let expr: string = "RstoxAPI::runFunction(what='" + what + "', package='" + pkg + "', args='" + args + "')";
    console.log(expr);
    // Apply json conversion
    let jsonexpr: string = 'jsonlite::toJSON(' + expr + ', pretty=T, auto_unbox=T, na="string")';
    return callR(client, jsonexpr);
  }

  async function logAPI(p: any, withResult: any = true, withTime: any = false) {
    //console.log("call p")
    //console.log("after p")
    let res: { time: number, result: string } = await p;
    if (withResult) {
      console.log(JSON.stringify(res.result, null, 2));
    }
    const time2 = process.hrtime();
    //let dt = diff[0] + (diff[1] / 1000000000.0);
    if (withTime) {
      console.log(" took " + res.time + " sec");
    }
    return res.result;
  }

  // observe rpath in backend
  server.post('/callR', async (req: any, res: any) => {
    //logInfo('get rpath ' + properties.rPath);
    let s: any = await callFunction(rserve_client,
      req.body.what, req.body.args, req.body.pkg);
    res.send(s.result);
  });

  function resolveDefaultPath(defPath: string): string {
    // electron showOpenDialog defaultPath requires c:\\temp\\test on win32, otherwise c:/temp/test on mac/linux
    return process.platform == "win32" ? defPath.replace(/\//g, "\\") : defPath.replace(/\\/g, "/")
  }

  server.post('/browse', function (req: any, res: any) {
    logInfo("select a folder... wait");
    let defPath = resolveDefaultPath(req.body.defaultpath); // correct slashes in default path
    logInfo("default folder " + defPath);
    require('electron').dialog.showOpenDialog(mainWindow != null ? mainWindow : null, {
      title: 'Select a folder', defaultPath: /*require('os').homedir()*/ defPath,
      properties: [/*'openFile'*/'openDirectory']
    }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
      if (!object.filePaths || !object.filePaths.length) {
        logInfo("You didn't select a folder");
        return;
      }
      logInfo("You did select a folder");
      logInfo(object.filePaths[0]);
      res.send(object.filePaths[0]);
    });
  });

  server.post('/browsePath', function (req: any, res: any) {
    logInfo("select a file/folder path(s)");
    if (JSON.stringify(req.body) != '{}') {
      let defPath = resolveDefaultPath(req.body.defaultPath); // correct slashes in default path
      logInfo("default folder " + defPath);
      require('electron').dialog.showOpenDialog(mainWindow != null ? mainWindow : null, {
        title: req.body.title, defaultPath: defPath,
        properties: req.body.properties
      }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
        if (!object.filePaths || !object.filePaths.length) {
          logInfo("You didn't select anything");
          return;
        }

        logInfo("You selected : " + object.filePaths);

        res.send(object.filePaths);
      });
    }
  });

  server.post('/fileExists', function (req: any, res: any) {
    logInfo("check if a file exists");

    if (JSON.stringify(req.body) != '{}') {
      var filePath = req.body.filePath;

      if (fs.existsSync(filePath)) {
        res.send("true");
      } else {
        res.send("false");
      }
    }
  });

  server.post('/makeDirectory', function (req: any, res: any) {
    logInfo("make directory");

    if (JSON.stringify(req.body) != '{}') {
      var dirPath = req.body.dirPath;
      try {
        fs.mkdirSync(dirPath);
        res.send("true");
      } catch (error) {
        res.send(error);
      }
    }
  });

}