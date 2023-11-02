import { Injectable } from '@angular/core';

import { DataService } from './../service/data.service';

@Injectable()
export class OpenProjectDlgService {
  constructor(private dataService: DataService) {}

  display: boolean = false;

  projectPath: string = null;
  isOpening: boolean = false;

  async showDialog() {
    this.projectPath = <string>await this.dataService.getProjectRootPath().toPromise();
    this.display = true;
  }
}
