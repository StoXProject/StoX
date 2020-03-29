import { start } from "repl";

//handle setupevents as quickly as possible
const setupEvents = require('./../installers/setupEvents')
var mainWindow: any;

// global variables
// var projectRootPath: string;
// var projectPath: string;
// var rPath: string;
// var rStoxFtpPath: string;

var properties: any = null;



// properties.projectList = [{"projectPath": "c:/temp/aa", "projectName":"aa"}, {"projectPath":"c:/1/b", "projectName":"b"}];
//JSON.stringify(props)-> fil
//props = JSON.parse("from file")


// var rspawn = child_process.exec("Rscript -e \"library(opencpu);ocpu_start_server(5307)\"");

// grab the packages we need
var express = require('express');
var server = express();
var bodyParser = require('body-parser');
server.use(bodyParser.json())
var cors = require('cors');
server.use(cors()) // enable cors in header (http call from static resources)
server.options(cors());

var child_process: any;
var rspawn: any;
var opencpuProcess: any; // Opencpu process
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


function createWindow() {

  var port = 3000;
  server.listen(port);
  // start the server
  console.log('Node express server started at port ' + port + ". Available at http://localhost:" + port);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'StoX 3.0',
    webPreferences: {
      nodeIntegration: true
    }
  })

  server.post('/browse', function (req: any, res: any) {
    console.log("select a folder... wait");
    let defPath = req.body.defaultpath.replace(/\\/g, "/"); // convert backslash to forward
    console.log("default folder " + defPath);
    require('electron').dialog.showOpenDialog(mainWindow, {
      title: 'Select a folder', defaultPath: /*require('os').homedir()*/ defPath,
      properties: [/*'openFile'*/'openDirectory']
    }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
      if (!object.filePaths || !object.filePaths.length) {
        console.log("You didn't select a folder");
        return;
      }
      console.log("You did select a folder");
      console.log(object.filePaths[0]);
      res.send(object.filePaths[0]);
    });
  });

  server.post('/browsePath', function (req: any, res: any) {
    console.log("select a file/folder path(s)");

    if (JSON.stringify(req.body) != '{}') {

      require('electron').dialog.showOpenDialog(mainWindow, {
        title: req.body.title, defaultPath: req.body.defaultPath,
        properties: req.body.properties
      }).then((object: { canceled: boolean, filePaths: string[], bookmarks: string[] }) => {
        if (!object.filePaths || !object.filePaths.length) {
          console.log("You didn't select anything");
          return;
        }

        console.log("You selected : " + object.filePaths);

        res.send(object.filePaths);
      });
    }
  });

  server.post('/fileExists', function (req: any, res: any) {
    console.log("check if a file exists");

    if (JSON.stringify(req.body) != '{}') {
      var filePath = req.body.filePath;

      if (require('fs').existsSync(filePath)) {
        res.send("true");
      } else {
        res.send("false");
      }
    }
  });

  server.post('/makeDirectory', function (req: any, res: any) {
    console.log("make directory");

    if (JSON.stringify(req.body) != '{}') {
      var dirPath = req.body.dirPath;
      try {
        require('fs').mkdirSync(dirPath);
        res.send("true");
      } catch (error) {
        res.send(error);
      }
    }
  });

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

app.on('ready', function () {
  console.log("lifecycle: ready")
  readPropertiesFromFile();
  startOpenCPU();
  if (!setupEvents.handleSquirrelEvent()) {
    createWindow()
  }
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
  console.log('ev:app quit');
  writePropertiesToFile();
  if (opencpuProcess != null) {
    console.log("Terminating opencpu process " + opencpuProcess.pid);
    process.exit(opencpuProcess.pid);
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const createMenu = function createMenu() {
  // Read app properties file from disc here.
  console.log('ev:ready');

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


// observe project root path
server.get('/projectrootpath', function (req: any, res: any) {
  //console.log('get project root path ' + properties.projectRootPath);
  res.send(properties.projectRootPath);
});

// observe rpath in backend
server.get('/rpath', function (req: any, res: any) {
  //console.log('get rpath ' + properties.rPath);
  res.send(properties.rPath);
});

function startOpenCPU(): string {
  console.log("Running on Platform: " + process.platform)
  if (process.platform == "win32"/*windows*/ || process.platform == "darwin"/*mac*/) {
    // On linux, sudo is required and opencpu must be installed separatly. check this
    var command = properties.rPath == "" || properties.rPath == null ? "Rscript" : properties.rPath + "/" + "Rscript";
    //console.log('command : ' + command);
    child_process = require('child_process');
    child_process.exec(command + " -e \"print(TRUE)\"", (error: any, stdout: any, stderr: any) => {
      if (error) {
        //console.error(`exec error: ${error}`);
        return error;
      }
      //console.log(`stdout: ${stdout}`);
      //console.error(`stderr: ${stderr}`);
      if (stdout !== null && stdout.includes("TRUE")) {
        child_process.exec(command + " -e \"eval('opencpu' %in% rownames(installed.packages()))\"", (error: any, stdout: any, stderr: any) => {
          if (error) {
            //console.error(`exec error: ${error}`);
            return error;
          } else {
            //console.log(`stdout: ${stdout}`);
            //console.error(`stderr: ${stderr}`);
            if (stdout !== null) {
              if (stdout.includes("FALSE")) {
                console.log("installing opencpu...");
                child_process.execSync(command + " -e \"install.packages('opencpu', repos='http://cran.us.r-project.org')\"");
                console.log("opencpu installed.");
              }
              console.log("Starting opencpu ...");
              let ocpucmd = command + " -e \"opencpu::ocpu_start_server(5307)\"";
              //let pr : any = child_process.exec(ocpucmd);
              // spawn a process instead of exec (this will not include a intermediate hidden shell process cmd)
              let opencpuProcess: any = child_process.spawn(command, ['-e', 'opencpu::ocpu_start_server(5307)']);
              opencpuProcess.on('error', (er: any) => { console.log(er) });
              console.log("Process " + opencpuProcess.pid + " started with " + ocpucmd)
              console.log("opencpu started.");
            }
          }
        }
        );
      }
    });
  }
  return "ok";
}
// modify rpath in backend
server.post('/rpath', function (req: any, res: any) {
  properties.rPath = req.body.rpath;
  //console.log('rpath ' + properties.rPath);
  let resultstr: string = startOpenCPU();
  res.send('post /rpath result:' + resultstr);
});

/*server.post('/login', function (req: any, res: any) {
  var user_name = req.body.user;
  var password = req.body.password;
  console.log("User name = " + user_name + ", password is " + password);
  res.end("yes");
});*/

const readPropertiesFromFile = function readPropertiesFromFile() {
  let propFileName = require('os').homedir() + "/.stox.properties.json";
  try {
    let fs = require('fs');
    if (fs.existsSync(propFileName)) {
      properties = JSON.parse(fs.readFileSync(propFileName, { encoding: 'utf-8', flag: 'r' }));
      console.log("Properties read from file: " + propFileName);
    }
    if (properties == null) {
      // Properties not read properly from file, or the file doesnt exist.
      console.log("create initial properties")
      properties = {
        "projectRootPath": require('os').homedir(),
        "activeProject": {},
        "rPath": "",
        "rStoxFtpPath": ""
      };
      console.log("Properties initialized.");
    }
  } catch (err) {
    console.log("Error reading properties: " + err);
  }
}

const writePropertiesToFile = function writePropertiesToFile() {
  if (properties == null) {
    return; // Prevent properties to be reset.
  }
  let resourcefile = require('os').homedir() + "/.stox.properties.json";
  try {
    let fs = require('fs');
    let options = { encoding: 'utf-8', flag: 'w' };
    /*if (properties.projectRootPath) {
      properties.projectRootPath = require('os').homedir();
    */
    let str = JSON.stringify(properties, null, 2);
    //console.log("jsonString : " + jsonString);
    fs.writeFileSync(resourcefile, str, options)
  } catch (err) {
    console.log("Error writing properties " + err);
  }
}

// server.post('/updateprojectlist', function (req: any, res: any) {
//   let jsonString = req.body.jsonString;
//   console.log("in updateprojectlist jsonString : " + jsonString);
//   properties.projectList = JSON.parse(jsonString);
//   res.send("project list updated");
// });

// server.get('/readprojectlist', function (req: any, res: any) {
//   let jsonString = JSON.stringify(properties.projectList);
//   res.send(jsonString); 
// });

server.post('/updateactiveproject', function (req: any, res: any) {
  let jsonString = req.body.jsonString;
  //console.log("in updateactiveproject jsonString : " + jsonString);
  properties.activeProject = JSON.parse(jsonString);
  res.send("active project updated");
});

server.get('/readactiveproject', function (req: any, res: any) {
  let jsonString = JSON.stringify(properties.activeProject);
  //console.log("in readactiveproject jsonString : " + jsonString);
  res.send(jsonString);
});

server.post('/updateprojectrootpath', function (req: any, res: any) {
  let jsonString = req.body.jsonString;
  //console.log("in updateprojectrootpath jsonString : " + jsonString);
  properties.projectRootPath = JSON.parse(jsonString);
  res.send("project root path updated");
});