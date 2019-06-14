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