//handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// global variables
var projectRootPath;
var projectPath;
var rPath;
var rStoxFtpPath;

var child_process = require('child_process');
var rspawn = child_process.exec("RScript -e \"library(opencpu);ocpu_start_server(5307)\"");

// grab the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var server = express();
var port = 3000;

server.listen(port);
// start the server
console.log('Server started! At http://localhost:' + port);

server.use(bodyParser.json())
server.use(cors()) // enable cors in header (http call from static resources)

// let rPath = "C:/Users/user/Documents/R"; // read from local properties file.
// console.log('homedir:' + require('os').homedir())

// observe rpath in backend
server.get('/rpath', function (req, res) {
  console.log('rpath '+ rPath);
  res.send(rPath);
});

// modify rpath in backend
server.post('/rpath', function (req, res) {
  rPath = req.body.rpath;
  console.log('rpath '+ rPath);

  var command = rPath == "" || rPath == null ? "RScript" :  rPath + "/" + "RScript";

  console.log('command : '+ command);

  // var commandExists = require('command-exists');
  
  // commandExists(command, function(err, data) {
  //     if(data) {
  //         // proceed confidently knowing this command is available
  //         console.log("command exists" );
  //     }
  //     if(err) {
  //       console.log("command does not exist : " + err.error);
  //     }
  //   }
  // );

  var commandExistsSync = require('command-exists').sync;

  if(commandExistsSync(command)) {
    console.log("command " + command + " exists");
    res.send("command " + command + " exists");
  } else {
    console.log("command " + command + " does not exist.");
    res.send("command " + command + " does not exist.");
  }

  // res.send('post performed ok');
});

server.post('/login', function (req, res) {
  var user_name = req.body.user;
  var password = req.body.password;
  console.log("User name = " + user_name + ", password is " + password);
  res.end("yes");
});

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'StoX 3.0',
    webPreferences: {
      nodeIntegration: true
    }
  })

  // mainWindow.setMenu(null);
  createMenu();

  // and load the index.html of the app.
  mainWindow.loadFile('frontend/dist/stox/index.html')

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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


app.on('quit', function () {
  // Write app properties file to disc here.
  console.log('ev:app quit');
  writeFile();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function createMenu() {
  // Read app properties file from disc here.
  console.log('ev:ready');
  readFile();

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

function readFile() {
  let resourcefile = require('os').homedir() + "/.stox.config.xml";
  fs = require('fs');
  var options = {encoding: 'utf-8', flag: 'r'};
  var xml2js = require('xml2js');
  var parser = new xml2js.Parser({explicitArray: false});
  
  if(!fs.existsSync(resourcefile)) {
    console.log("Resource file (.stox.config.xml) does not exist");
    return;
  }

  // read if resource file is found
  var xml = fs.readFileSync(resourcefile, options);
  
  parser.parseString(xml, function (err, result) {
      if (err) {
          console.error('xml2js.parseString: Error occurred: ', err);
      } else {
          // console.log(JSON.stringify(result, null, 2));
          // console.log('projectroot : ', result.stox.$.projectroot);
          projectRootPath = result.stox.$.projectroot;
          console.log('projectRootPath : ', projectRootPath);
          // console.log('project : ', result.stox.$.project);
          projectPath = result.stox.$.project;
          console.log('projectPath : ', projectPath);
          // console.log('rfolder : ', result.stox.$.rfolder);
          rPath = result.stox.$.rfolder;
          console.log('rPath : ', rPath);
          // console.log('rStoxFTPPath : ', result.stox.$.rStoxFTPPath);
          rStoxFtpPath = result.stox.$.rStoxFTPPath;
          console.log('rStoxFtpPath : ', rStoxFtpPath);
      }
  });  
}

function writeFile() {
  // if(projectRootPath == null || projectPath == null || rPath == null || rStoxFtpPath == null) {
  //   return;
  // }

  var result = {
    "stox": {
      "$": {
        "projectroot": projectRootPath == null ? "" : projectRootPath,
        "project": projectPath == null ? "" : projectPath,
        "rfolder": rPath == null ? "" : rPath,
        "rStoxFTPPath": rStoxFtpPath == null ? "" : rStoxFtpPath
      }
    }
  };

  let resourcefile = require('os').homedir() + "/.copy_stox.config.xml";

  fs = require('fs'); 
  var xml2js = require('xml2js'); 
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(result);

  var options = {encoding:'utf-8', flag:'w'};

  fs.writeFileSync(resourcefile, xml, options);

  // fs.writeFile(resourcefile, xml, function(err, data) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("successfully written to xml file");
  //   }
  // });
}