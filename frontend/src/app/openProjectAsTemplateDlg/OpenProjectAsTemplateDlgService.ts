import { Injectable } from '@angular/core';

import { DataService } from './../service/data.service';

@Injectable()
export class OpenProjectAsTemplateDlgService {
  constructor(private dataService: DataService) {}

  display: boolean = false;
  projectName: string = null;
  projectPath: string = null;
  isOpening: boolean = false;
  projectNewPath: string = null;

  async showDialog() {
    //this.projectPath = <string>await this.dataService.getProjectRootPath().toPromise();
    
    this.display = true;
  }
}
