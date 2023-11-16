import { Component, OnInit } from '@angular/core';

import { RunService } from '../service/run.service';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.scss'],
})
export class RunComponent implements OnInit {
  constructor(private runService: RunService) {}

  ngOnInit() {}

  buttons = [
    { cmd: 'run', iclass: 'runicon' },
    { cmd: 'runnext', iclass: 'runnexticon' },
    { cmd: 'runfromhere', iclass: 'runfromhereicon' },
    { cmd: 'runto', iclass: 'runtoicon' },
    { cmd: 'reset', iclass: 'reseticon' },
    { cmd: 'addprocess', iclass: 'addprocessicon' },
    { cmd: 'stop', iclass: 'stopicon' },
  ];

  public getActionTooltip(cmd: string): string {
    switch (cmd) {
      case 'run':
        return 'Run model'; // or "Continue model" if active process > -1
      case 'runnext':
        return 'Run next process';
      case 'runfromhere':
        return 'Run from here';
      case 'runto':
        return 'Run to here'; // or "Run this if selected process < active process"
      case 'reset':
        return 'Reset model';
      case 'addprocess':
        return 'Add process';
      case 'stop':
        return 'Stop model';
      default:
        throw 'getActionTooltip(cmd) called with cmd=' + cmd;
    }
  }
  public getActionEnabled(cmd: string): boolean {
    switch (cmd) {
      case 'run':
        return this.runService.canRun(); /*&& !this.runService.hasFunctionalError()*/ // or "Continue model" if active process > -1
      case 'runnext':
        return this.runService.canRunNext();
      case 'runfromhere':
        return this.runService.canRunFromHere();
      case 'runto':
        return this.runService.canRunToHere(); // or "Run this if selected process < active process"
      case 'reset':
        return this.runService.canReset();
      case 'stop':
        return this.runService.canStop();
      case 'addprocess':
        return this.runService.canAddProcess();
      default:
        throw 'getActionEnabled(cmd) called with cmd=' + cmd;
    }
  }
  async handleClick(command) {
    //console.log("> " + command)
    switch (command) {
      case 'run':
        return this.runService.run();
      case 'reset':
        return this.runService.reset();
      case 'stop':
        return this.runService.stop();
      case 'runnext':
        return this.runService.runNext();
      case 'runfromhere':
        return this.runService.runFromHere();
      case 'addprocess':
        return this.runService.addProcess();
    }
  }
}
