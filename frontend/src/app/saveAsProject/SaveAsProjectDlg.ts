import { Project } from './../data/project';
import { ProjectService } from './../service/project.service';
import { Component, OnInit } from '@angular/core';
import { SaveAsProjectDlgService } from './SaveAsProjectDlgService';
import { DataService } from '../service/data.service';
import { MessageService } from '../message/MessageService';

@Component({
    selector: 'SaveAsProjectDlg',
    templateUrl: './SaveAsProjectDlg.html',
    styleUrls: ['./SaveAsProjectDlg.css']
  })
export class SaveAsProjectDlg  implements OnInit {

    projectRootPath: string;
    projectName: string; 

    constructor(public service: SaveAsProjectDlgService, private dataService: DataService, 
        private msgService: MessageService, private ps: ProjectService) {
    }

    async ngOnInit() {
        this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();

        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");
    }

    async browse() {
        console.log("browse");
        this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");

        // let jsonString = JSON.stringify(this.projectRootPath);
        // let status = <string> await this.dataService.updateProjectRootPath(jsonString).toPromise();
        // console.log(status); 
    }

    async apply() {

        // check if  projectRootPath and projectName are given
        if(!this.projectName) {            
            this.msgService.setMessage("Project name is empty!");
            this.msgService.showMessage();
            return;
        }
        console.log("project : " + this.projectName);

        if(!this.projectRootPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();            
            return;
        }
        console.log("projectRootPath : " + this.projectRootPath);        

        // check if projectRootPath exists
        let options = {filePath: this.projectRootPath};
        let exists = await this.dataService.fileExists(options).toPromise();

        if(exists != "true") {
            this.msgService.setMessage("Project root folder does not exist!");
            this.msgService.showMessage();            
            return;
        }

        let wholePath = this.projectRootPath + "/" + this.projectName;

        // check if projectRootPath + projectName exists
        options.filePath = wholePath;
        exists = await this.dataService.fileExists(options).toPromise();
 
        // create projectRootPath + projectName if it doesn't exist and show error otherwise
        if(exists == "true") {
            this.msgService.setMessage(this.projectName + " exists before!");
            this.msgService.showMessage();            
            return;
        } 

        try {
            let dirOption = {dirPath: wholePath};
            let dirCreated = await this.dataService.makeDirectory(dirOption).toPromise();

            if(dirCreated != "true") {
                this.msgService.setMessage("Couldn't create directory : " + dirCreated);
                this.msgService.showMessage();            
                return; 
            }

            let project: Project = await this.dataService.saveAsProject(this.ps.selectedProject.projectPath, wholePath).toPromise();
            // third parameter in saveAsProject
            // make a shift to this project (make it as current project??)
            
        } catch(error) {
            console.log(error);
            var firstLine = error;
            this.msgService.setMessage(firstLine);
            this.msgService.showMessage();            
            return;
        }

        this.service.display = false;
    }
}