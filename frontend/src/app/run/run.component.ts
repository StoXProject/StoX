import { Component, OnInit } from '@angular/core';
import { RunService } from '../service/run.service';
@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.scss']
})
export class RunComponent implements OnInit {

  constructor(private runService: RunService) { }

  ngOnInit() {
  }

  buttons = [
    { cmd: "run", iclass: "runicon" },
    { cmd: "runnext", iclass: "runnexticon" },
    { cmd: "runfromhere", iclass: "runfromhereicon" },
    { cmd: "runto", iclass: "runtoicon" },
    { cmd: "reset", iclass: "reseticon" },
    { cmd: "addprocess", iclass: "addprocessicon" },
  ];

  public getActionTooltip(cmd: string): string {
    switch (cmd) {
      case "run": return "Run model" // or "Continue model" if active process > -1
      case "runnext": return "Run next process";
      case "runfromhere": return "Run from here"
      case "runto": return "Run to here" // or "Run this if selected process < active process"
      case "reset": return "Reset model"
      case "addprocess": return "Add process" 
      default:
        throw "getActionTooltip(cmd) called with cmd=" + cmd;
    }
  }
  public getActionEnabled(cmd: string): boolean {
    switch (cmd) {
      case "run": return true; // or "Continue model" if active process > -1
      case "runnext": return true;
      case "runfromhere": return true;
      case "runto": return false; // or "Run this if selected process < active process"
      case "reset": return true;
      case "addprocess": return true;
      default:
        throw "getActionEnabled(cmd) called with cmd=" + cmd;
    }
  }
  async handleClick(command) {
    //console.log(command)
    switch (command) {
      case "run":
        this.runService.run();
        //console.log('Done!'); 
        break;

    }
  }
}
