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
var callr_evaluate: boolean[] = [];

const net = require("net")
let client: any = null;


let useOpenCPU: boolean = false;

//let rserve_client: any = null;

var properties: any = null;
var activeProjectSaved: boolean = true;
var log: any = null;
var server: any = null;
var rAvailable: boolean = false;
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
  await startNodeServer();
  readPropertiesFromFile();
  await startBackendServer();
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
  logInfo("Starting Node Server at port " + port + "...");
  await new Promise(r => {
    server.listen(port, () => {
      logInfo('Node Server started at http://localhost:' + port);
      r()
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
  mainWindow.on('close', (e: any) => {
    onClosed(e)
  })
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
function showElectronMessageBox(title: string, message: string, buttons: string[]): number {
  return require('electron').dialog.showMessageBoxSync(null,
    {
      type: 'question',
      buttons: buttons,
      title: title,
      message: message
    });
}

function onClosed(e: any) {
  logInfo('close - saved:' + activeProjectSaved + ' project: ' + (properties != null && properties.activeProject != null ? properties.activeProject : ''))
  if (properties != null && properties.activeProject !== null) {
    let save = false;
    if (!activeProjectSaved) {
      var choice = showElectronMessageBox('Save project', 'Save changes to project before closing?', ['Yes', 'No', 'Cancel']);
      if (choice == 0) {
        save = true;
      }
      if (choice == 2) { // cancel
        e.preventDefault();
        return;
      }
    }
    let cmd = JSON.stringify({
      what: "closeProject",
      args: JSON.stringify({ projectPath: properties.activeProject, save: save }),
      package: "RstoxFramework"
    })
    callR(cmd);//.then((r: any) => logInfo(r));        //callR(cmd).then((r: any)=>logInfo(r));
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

async function startBackendServer(): Promise<string> {
  logInfo('Start backend');
  if (client != null) {
    logInfo('Close existing client');
    client.destroy();
    logInfo('Client closed');
  }
  logInfo('Create client socket');
  client = null;//new net.Socket();
  rAvailable = await checkRAvailable();
  if (!rAvailable) {
    logInfo('R is not available- quitting startBackendServer');
    return "";
  }
  var rscriptBin = rScriptBin();
  const path = require('path');
  const resPath = __dirname + '/../srv';
  logInfo('Resource file ' + resPath);
  let resFile = path.join(resPath, 'server.R');
  logInfo('Resource file ' + resFile);
  let serverScript = fs.readFileSync(resFile, { encoding: 'utf-8', flag: 'r' })
  let fileName = require('temp-dir') + "/stox.server.R";
  logInfo("Writing server.R into " + fileName);
  await fs.writeFile(fileName, serverScript, () => { });
  let serverCmd = rscriptBin + " " + fileName;
  // spawn a process instead of exec (this will not include a intermediate hidden shell process cmd)
  logInfo("Spawning " + rscriptBin + " " + fileName);
  backendProcess = child_process.spawn(rscriptBin, [fileName]);
  backendProcess.on('error', (er: any) => {
    logInfo("Spawning error " + er);
  });
  // console.log("Process " + backendProcess.pid + " started with " + serverCmd)
  logInfo("Backend started.");
  //console.log(backendProcess.pid);
  //rserve_client = await connectRserve(rserve);
  await createConnection();
  return "ok";
}

/**
 * Create a safe connection to socket with timeout loop. Either success or failure in each try.
 */
async function createConnection() {
  for (let i = 1; i <= 10000; i++) {
    await new Promise(r => setTimeout(() => { r(); }, 400/*ms*/)); // createConnection synchr. takes however 1 sec.
    logInfo("Connecting to " + "localhost" + ":" + 6312 + " try " + i);
    let connected = false;
    await new Promise(resolve => {
      client = new net.createConnection(6312, "localhost")
        .on('connect', function () {
          connected = true;
          logInfo("Connected in try " + i);
          resolve();
        }).on('error', function (err: any) {
          logInfo(err);
          resolve();
        });
    });
    if (connected) {
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

const readPropertiesFromFile = function readPropertiesFromFile() {
  let propFileName = require('os').homedir() + "/.stox.properties.json";
  try {
    if (fs.existsSync(propFileName)) {
      try {
        properties = JSON.parse(fs.readFileSync(propFileName, { encoding: 'utf-8', flag: 'r' }));
      } catch (err) {
        properties = null;
        logInfo("Properties not read due to error " + err);
      }
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
    if (properties.projectRootPath == null || properties.projectRootPath == "") {
      properties.projectRootPath = require('os').homedir()
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

function callR(arg: string) {
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
    let ans: any = await evaluate(client, arg);

    callr_evaluate.splice(callr_evaluate.length - 1, 1);
    //let resparsed = JSON.parse(ans);
    let diff = process.hrtime(startTime);
    resolve({ time: diff[0] + diff[1] / 1000000000, result: ans });
  });
}

/*async function logAPI(p: any, withResult: any = true, withTime: any = false) {
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
}*/

/*function body(what: string, args: string, pkg: string) {
  return JSON.stringify({
    "what": what,
    "args": args,
    "package": pkg
  });
}*/

async function evaluate(client: any, cmd: string) {
  //console.log("cmd: " + cmd);
  let s = Buffer.from(cmd, 'utf8').toString('hex'); // Encode command as hex
  let lens = "" + s.length;
  await new Promise(async resolve => {
    client.handle = (data: any) => {
      if (data == lens) {
        // The length is send forth and back, we an proceed
        resolve();
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
        resolve();
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
        resolve();
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
    logInfo("update active project: " + properties.activeProject)
    res.send("ok");
  });
  server.post('/updateactiveprojectsavedstatus', function (req: any, res: any) {
    activeProjectSaved = req.body === "true";
    logInfo("update active project saved status: " + activeProjectSaved)
    res.send("ok");
  });

  server.get('/readactiveproject', function (req: any, res: any) {
    logInfo("read active project: " + properties.activeProject)
    res.send(properties.activeProject);
  });

  server.post('/updateprojectrootpath', function (req: any, res: any) {
    let projectRootPath = req.body;
    //logInfo("in updateprojectrootpath jsonString : " + jsonString);
    properties.projectRootPath = projectRootPath;
    res.send("project root path updated");
  });
  // modify rpath in backend
  server.post('/rpath', async (req: any, res: any) => {
    properties.rPath = req.body;
    logInfo('set rpath ' + properties.rPath);
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
    logInfo('get rpath ' + properties.rPath);
    res.send(properties.rPath);
  });

  // observe rpath in backend
  server.post('/callR', async (req: any, res: any) => {
    // console.log("cmd: \"" + s.replace(/"/g, '\\"') + "\"");
    //logInfo(req.body);
    // this is a timout for a specific route for node express server.
    // This will make long r calls like bootstrapping work.
    req.setTimeout(2073600000); // use 24days proxy timeout.
    let s: any = await callR(req.body);
    //logInfo('call R result' + require('util').inspect(s));
    // res.type('text/plain');
    res.send(s.result);
  });

  function resolveDefaultPath(defPath: string): string {
    // electron showOpenDialog defaultPath requires c:\\temp\\test on win32, otherwise c:/temp/test on mac/linux
    return defPath == null ? require('os').homedir() : process.platform == "win32" ? defPath.replace(/\//g, "\\") : defPath.replace(/\\/g, "/");
  }

  server.post('/browse', function (req: any, res: any) {
    logInfo("select a folder... wait");
    let defPath = resolveDefaultPath(req.body); // correct slashes in default path
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
    let options: any = JSON.parse(req.body);
    if (Object.keys(options).length) {
      let defPath = resolveDefaultPath(options.defaultPath); // correct slashes in default path
      logInfo("default folder " + defPath);
      require('electron').dialog.showOpenDialog(mainWindow != null ? mainWindow : null, {
        title: options.title, defaultPath: defPath,
        properties: options.properties
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

    let filePath: string = req.body;
    if (filePath.length > 0 && fs.existsSync(filePath)) {
      res.send("true");
    } else {
      res.send("false");
    }
  });

  server.post('/openUrl', function (req: any, res: any) {
    logInfo("open url");
    let url: string = req.body;
    if (url.length > 0) {
      try {
        require('electron').shell.openExternal(url);
        res.send("url opened");
      } catch(error) {
        res.send(error);
      }
    }
  });  

  server.get('/rAvailable', async (req: any, res: any) => {
    logInfo("check if r is available");
    res.send(rAvailable);
  });


  server.post('/makeDirectory', function (req: any, res: any) {
    logInfo("make directory");
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
    logInfo("/exit");
    logInfo(mainWindow);
    if (mainWindow != null) {
      logInfo("have window");
      mainWindow.close()
      res.send("true");
    }
  });

  server.post('/stoxhome', async function (req: any, res: any) {
    logInfo("/stoxhome");
    const { shell } = require('electron');
    await shell.openExternal('http://www.imr.no/forskning/prosjekter/stox/');
  });

  server.post('/isdesktop', function (req: any, res: any) {
    res.send(mainWindow != null ? true : false);
  });

  server.post('/toggledevtools', async function (req: any, res: any) {
    logInfo("/toggledevtools");
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools();
    }
    res.send("true");
  });
}