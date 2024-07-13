import { UserLogEntry } from '../data/userlogentry';
import { UserLogType } from '../enum/enums';
import { Injectable } from '@angular/core';

import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';

@Injectable()
export class RConnectionDlgService {
  constructor(
    private dataService: DataService,
    private ps: ProjectService
  ) {}

  display: boolean = false;
  rpath: string;
  isConnecting: boolean;

  async showDialog() {
    console.log('> ' + 'showDialog');
    this.rpath = <string>await this.dataService.getRPath().toPromise();
    console.log('> ' + 'rpath retrieved: ' + this.rpath);
    this.display = true;
  }

  async apply() {
    console.log('> ' + 'apply');
    console.log('> ' + 'Posting rpath: ' + this.rpath);
    this.rpath = this.rpath.replace(/\\/g, '/'); // convert backslash to forward
    console.log('> ' + 'Posting rpath with forward slash: ' + this.rpath);
    this.isConnecting = true;
    try {
      console.log('> ' + 'Setting R path...');
      const res = <string>await this.dataService.setRPath(this.rpath).toPromise();
      console.log('> ' + 'Posting rpath, response ' + res);
      await this.ps.checkRstoxFrameworkAvailability();
      //logInfo('R connection set to ' + res);
      this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, "\n" + "R connection set to " + this.rpath + ')\n'));
    } finally {
      this.isConnecting = false;
    }

    this.display = false;
  }

  async browse() {
    this.rpath = await this.dataService.browse(this.rpath).toPromise();
  }
}
