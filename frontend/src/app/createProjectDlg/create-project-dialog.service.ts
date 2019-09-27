import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
// import { Template } from '../data/Template';

@Injectable({
  providedIn: 'root'
})
export class CreateProjectDialogService {

  constructor(private dataService: DataService) { }

  display: boolean = false;
  // projectRootPath: string;
  // project: string;
  // templates: Template[];

  async showDialog() {
      // console.log("showDialog");
      // this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
      // console.log("project root path retrieved: " + this.projectRootPath);
      // this.project = <string>await this.dataService.getProjectPath().toPromise();
      // console.log("project path retrieved: " + this.project);
      // this.templates = <Template[]> JSON.parse( await this.dataService.getAvailableTemplates().toPromise());
      // console.log("templates retrieved: " + this.templates.length);
      this.display = true;
  }  

  // async browse() {
  //   console.log("browse");
  //   this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
  // } 
  
  async apply() {

    this.display = false;
  }  

  // async initData() {
  //   console.log("initData");
  //   this.templates = <Template[]> await this.dataService.getAvailableTemplates().toPromise();
    
  // } 
}
