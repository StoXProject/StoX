//handle setupevents as quickly as possible
const setupEvents = require('./../installers/setupEvents')
var mainWindow: any;

// global variables
// var projectRootPath: string;
// var projectPath: string;
// var rPath: string;
// var rStoxFtpPath: string;

var properties = {
  "projectRootPath": "",
  "activeProject": {},
  "rPath": "",
  "rStoxFtpPath": ""
};

// properties.projectList = [{"projectPath": "c:/temp/aa", "projectName":"aa"}, {"projectPath":"c:/1/b", "projectName":"b"}];
//JSON.stringify(props)-> fil
//props = JSON.parse("from file")


// var rspawn = child_process.exec("RScript -e \"library(opencpu);ocpu_start_server(5307)\"");

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
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function createWindow() {

  child_process = require('child_process');
  rspawn = child_process.exec("RScript -e \"eval('opencpu' %in% rownames(installed.packages()))\"", (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    } else {
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      if (stdout !== null && stdout.includes("FALSE")) {
        console.log("opencpu is not installed, and is try to install it now ...");
        child_process.execSync("RScript -e \"install.packages('opencpu', repos='http://cran.us.r-project.org')\"");
        console.log("Starting opencpu ...");
        child_process.exec("RScript -e \"library(opencpu);ocpu_start_server(5307)\"");
      } else if (stdout !== null && stdout.includes("TRUE")) {
        console.log("Starting opencpu ...");
        child_process.exec("RScript -e \"library(opencpu);ocpu_start_server(5307)\"");
      }
    }
  });

  var port = 3000;
  server.listen(port);
  // start the server
  console.log('Server started! At http://localhost:' + port);

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
    require('electron').dialog.showOpenDialog(mainWindow, {
      title: 'Select a folder', defaultPath: /*require('os').homedir()*/ req.body.defaultpath,
      properties: [/*'openFile'*/'openDirectory']
    }, (folderPath: any) => {
      if (!folderPath || !folderPath.length) {
        console.log("You didn't select a folder");
        return;
      }
      console.log("You did select a folder");
      console.log(folderPath[0]);
      res.send(folderPath[0]);
    });
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
  console.log("App is ready")
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
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


const createMenu = function createMenu() {
  // Read app properties file from disc here.
  console.log('ev:ready');
  readPropertiesFromFile();

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

// const readFile = function readFile() {
//   let resourcefile = require('os').homedir() + "/.stox.config.xml";
//   let fs = require('fs');
//   var options = { encoding: 'utf-8', flag: 'r' };
//   var xml2js = require('xml2js');
//   var parser = new xml2js.Parser({ explicitArray: false });

//   if (!fs.existsSync(resourcefile)) {
//     console.log("Resource file (.stox.config.xml) does not exist");
//     return;
//   }

//   // read if resource file is found
//   var xml = fs.readFileSync(resourcefile, options);

//   parser.parseString(xml, function (err: any, result: any) {
//     if (err) {
//       console.error('xml2js.parseString: Error occurred: ', err);
//     } else {
//       // console.log(JSON.stringify(result, null, 2));
//       // console.log('projectroot : ', result.stox.$.projectroot);
//       projectRootPath = result.stox.$.projectroot;
//       console.log('projectRootPath : ', projectRootPath);
//       // console.log('project : ', result.stox.$.project);
//       projectPath = result.stox.$.project;
//       console.log('projectPath : ', projectPath);
//       // console.log('rfolder : ', result.stox.$.rfolder);
//       rPath = result.stox.$.rfolder;
//       console.log('rPath : ', rPath);
//       // console.log('rStoxFTPPath : ', result.stox.$.rStoxFTPPath);
//       rStoxFtpPath = result.stox.$.rStoxFTPPath;
//       console.log('rStoxFtpPath : ', rStoxFtpPath);
//     }
//   });
// }

// const writeFile = function writeFile() {
//   // if(projectRootPath == null || projectPath == null || rPath == null || rStoxFtpPath == null) {
//   //   return;
//   // }

//   var result = {
//     "stox": {
//       "$": {
//         "projectroot": projectRootPath == null ? "" : projectRootPath,
//         "project": projectPath == null ? "" : projectPath,
//         "rfolder": rPath == null ? "" : rPath,
//         "rStoxFTPPath": rStoxFtpPath == null ? "" : rStoxFtpPath
//       }
//     }
//   };

//   let resourcefile = require('os').homedir() + "/.copy_stox.config.xml";

//   let fs = require('fs');
//   var xml2js = require('xml2js');
//   var builder = new xml2js.Builder();
//   var xml = builder.buildObject(result);

//   var options = { encoding: 'utf-8', flag: 'w' };

//   fs.writeFileSync(resourcefile, xml, options);

//   // fs.writeFile(resourcefile, xml, function(err, data) {
//   //   if (err) {
//   //     console.log(err);
//   //   } else {
//   //     console.log("successfully written to xml file");
//   //   }
//   // });
// }


// let rPath = "C:/Users/user/Documents/R"; // read from local properties file.
// console.log('homedir:' + require('os').homedir())

// observe rpath in backend

// observe project path
// server.get('/projectpath', function (req: any, res: any) {
//   console.log('get project path ' + projectPath);
//   res.send(projectPath);
// });

// observe project root path
server.get('/projectrootpath', function (req: any, res: any) {
  console.log('get project root path ' + properties.projectRootPath);
  res.send(properties.projectRootPath);
});

// observe rpath in backend
server.get('/rpath', function (req: any, res: any) {
  console.log('get rpath ' + properties.rPath);
  res.send(properties.rPath);
});

// modify rpath in backend
server.post('/rpath', function (req: any, res: any) {
  properties.rPath = req.body.rpath;
  console.log('rpath ' + properties.rPath);

  var command = properties.rPath == "" || properties.rPath == null ? "RScript" : properties.rPath + "/" + "RScript";

  console.log('command : ' + command);

  child_process.exec(command + " -e \"print(TRUE)\"", (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.send(error);
      return;
    }

    properties.rPath = req.body.rpath;;

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    if (stdout !== null && stdout.includes("TRUE")) {
      child_process.exec(command + " -e \"eval('opencpu' %in% rownames(installed.packages()))\"", (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.send(error);
        } else {
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);

          if (stdout !== null && stdout.includes("FALSE")) {
            console.log("opencpu is not installed, and is trying to install it now ...");
            child_process.execSync(command + " -e \"install.packages('opencpu', repos='http://cran.us.r-project.org')\"");
            console.log("Starting opencpu ...");
            child_process.exec(command + " -e \"library(opencpu);ocpu_start_server(5307)\"");
          } else if (stdout !== null && stdout.includes("TRUE")) {
            // console.log("opencpu is installed, and is trying to remove it now ...");
            // child_process.execSync(command + " -e \"remove.packages('opencpu')\"");
            // console.log("trying to install opencpu now ...");
            // child_process.execSync(command + " -e \"install.packages('opencpu', repos='http://cran.us.r-project.org')\"");
            console.log("Starting opencpu ...");
            child_process.exec(command + " -e \"library(opencpu);ocpu_start_server(5307)\"");
          }
        }
      });
    }
  });

  res.send('post /rpath performed ok');
});

server.post('/login', function (req: any, res: any) {
  var user_name = req.body.user;
  var password = req.body.password;
  console.log("User name = " + user_name + ", password is " + password);
  res.end("yes");
});

const readPropertiesFromFile = function readPropertiesFromFile() {
  let resourcefile = require('os').homedir() + "/.stox.properties.json";
  try {
    let fs = require('fs');
    if (fs.existsSync(resourcefile)) {
      //file exists
      let options = { encoding: 'utf-8', flag: 'r' };
      let jsonString = fs.readFileSync(resourcefile, options);
      console.log("jsonString : " + jsonString);
      properties = JSON.parse(jsonString);
    }
  } catch (err) {
    console.log(err);
  }
}

const writePropertiesToFile = function writePropertiesToFile() {
  let resourcefile = require('os').homedir() + "/.stox.properties.json";
  try {
    let fs = require('fs');
    let options = { encoding: 'utf-8', flag: 'w' };
    if (!properties.projectRootPath) {
      properties.projectRootPath = require('os').homedir();
    }
    let jsonString = JSON.stringify(properties, null, 2);
    console.log("jsonString : " + jsonString);
    fs.writeFileSync(resourcefile, jsonString, options)
  } catch (err) {
    console.log(err);
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
  console.log("in updateactiveproject jsonString : " + jsonString);
  properties.activeProject = JSON.parse(jsonString);
  res.send("active project updated");
});

server.get('/readactiveproject', function (req: any, res: any) {
  let jsonString = JSON.stringify(properties.activeProject);
  console.log("in readactiveproject jsonString : " + jsonString);
  res.send(jsonString);
});

server.post('/updateprojectrootpath', function (req: any, res: any) {
  let jsonString = req.body.jsonString;
  console.log("in updateprojectrootpath jsonString : " + jsonString);
  properties.projectRootPath = JSON.parse(jsonString);
  res.send("project root path updated");
});