# StoX

## Introduction

StoX is an open source software developed at IMR, Norway, to analyze survey data and calculate survey estimates from acoustic and swept area surveys. The program is a stand-alone application for easy sharing and further development in cooperation with other institutes. 

“StoX is designed as a tool for transparent and reproducible survey estimation across nations and survey objectives. All methods, user settings and links to input data are documented in a description file. A process is a user‐defined call to one function available in a library of functions defined by StoX. Any StoX model can be modified by changing parameters of the processes, adding or removing processes and by rearranging their order of execution. Different StoX functions require one or more input datasets, which can be data files or output from previously executed processes.” [Johnsen, E., Totland, A., Skålevik, Å., Holmin, A. J., Dingsør, G. E., Fuglebakk, E., & Handegard, N. O. (2019). StoX: An open source software for marine survey analyses. Methods in Ecology and Evolution, 10(9), 1523-1528.](https://doi.org/10.1111/2041-210X.13250)

## Installation

Download StoX from (https://github.com/StoXProject/StoX/releases). For Windows download the .msi file, for MacOS download the .dmg file and for Linux download the .rpm or .deb file. Then follow the instructions below:

### Windows:

Step 1: 
Install by double-clicking on the downloaded .msi file, and follow the instructions.

Step 2: 
Install R 3.6.3 or newer if not already installed.

Step 3: 
Click on "Tools" > "R connection" in the menu to define the path to R (for example C:\Program Files\R\R-4.0.3\bin\x64).

Step 4: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. It is recommended to close Rstudio before running Install Rstox packages. 

Step 5: 
StoX is now ready for use.

### MacOS:

Step 1: 
Install by double-clicking on the downloaded .dmg file, and follow the instructions.

Step 2: 
Install R 3.6.3 or newer if not already installed.

Step 3: 
Open StoX by double clicking on the "StoX.app" in the Applications folder in the Finder app. If you get a message saying "StoX can't be opened because the identity of the developer cannot be confirmed", or similar, ctr + click and select Open. 

Step 4: 
Click on "Tools" > "R connection" in the menu to define the path to R. Normally the following path will work "/Library/Frameworks/R.framework/Resources/bin" (this path will work even if you at a later point in time upgrade R).

Step 5: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. It is recommended to close Rstudio before running Install Rstox packages. 

Step 6: 
StoX is now ready for use. 

### Linux:

Step 1: 
Install by double-clicking on the downloaded .rpm or .deb file, and follow the instructions. *****

Step 2: 
Install R 3.6.3 or newer if not already installed.

Step 3: 
*****

Step 4: 
Click on "Tools" > "R connection" in the menu to define the path to R. *****

Step 5: 
Click on "Tools" > "Install Rstox packages" in the menu. This will install the required R packages. It is recommended to close Rstudio before running Install Rstox packages. 

Step 6: 
StoX is now ready for use. 


## License

LGPL-3 © Norwegian Institute of Marine research (IMR) ([homepage](https://www.hi.no/en)).

---

### For historical release notes, see: https://github.com/StoXProject/StoX/blob/master/NEWS.md





















# StoX
StoX GUI
StoX GUI is a electron application combining node.js and chromium in a Browser-like window. In backend a node.js server is running on a port 3000, and opencpu at 3001. Opencpu is representing Rstox without state (active r memory). The session states are written to Rdata files in the backend. The electron app also serve static javascript pages transcompiled from angular project. Thus gettting use of advanced web components like Open Layers with projection. Visual Studio code is used as IDE to maintain the frontend and the backend, and also for the packaging and deployment process. This is handled in npm scripts.

Useful git commands
commit - visual studio code source control Ctrl+Enter runs add (stage) and the actul commit into current branch
push /pull or sync - visual studio code source control updates work dir from remote and vice versa
checkout - switches branch
git merge <branch> merge from branch into current branch  

work on feature branch, merge into develop, keep the master clean

To build
Install node from https://nodejs.org/en/download/
Install Visual Studio https://code.visualstudio.com/

run in terminal (i.e. git bash in visual studio) 
npm install

Tips:

There is a bug in electron-packager 14.0.0, so 13.1.1 should be used.
Using --save-dev when installing npm packages only used in script (electron/electron-packager, etc)
Using -g for npm, angular, cross-env (is used to set DEBUG flags in scripts for debugging)

to list out global packages installed
$ npm list -g --depth 0
C:\Users\aasmunds\AppData\Roaming\npm
+-- @angular/cli@8.0.3
+-- cross-env@5.2.0
`-- npm@6.9.2

to update local node_modules from package.json
npm install 

to remove package from global node_modules
npm uninstall [-g] <package>

to run a script
npm run <scriptname>

cross-env example
"package-win": "cross-env DEBUG=electron-packager electron-packager . stox --platform win32 --arch x64 --out dist/ --overwrite  --asar",


9YMj1zM70BAmuJ


To skip installing devDependencies, use npm install --production