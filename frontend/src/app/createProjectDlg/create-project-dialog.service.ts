import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class CreateProjectDialogService {

  constructor(private dataService: DataService) { }

  display: boolean = false;
  projectRootPath: string;
  project: string;

  async showDialog() {
      console.log("showDialog");
      this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
      console.log("project root path retrieved: " + this.projectRootPath);
      this.project = <string>await this.dataService.getProjectPath().toPromise();
      console.log("project path retrieved: " + this.project);
      this.display = true;
  }  

  async browse() {
    console.log("browse");
    this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
  } 
  
  async apply() {

    this.display = false;
  }  
}
