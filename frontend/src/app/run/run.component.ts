import { Component, OnInit } from '@angular/core';
import { RunService } from '../service/run.service';
@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.scss']
})
export class RunComponent implements OnInit {
  totalEstimate = 10;
  ctx = { estimate: this.totalEstimate };
  constructor(private runService: RunService) { }

  ngOnInit() {
  }

  buttons = [
    { cmd: "run", iclass: "runicon" },
    { cmd: "runnext", iclass: "runnexticon" },
    { cmd: "runfromhere", iclass: "runfromhereicon" },
    { cmd: "runto", iclass: "runtoicon" },
    { cmd: "reset", iclass: "reseticon" },
    { cmd: "process", iclass: "processicon" },
  ];

  public getActionTooltip(cmd: string): string {
    switch (cmd) {
      case "run": return "Run model" // or "Continue model" if active process > -1
      case "runnext": return "Run next process";
      case "runfromhere": return "Run from here"
      case "runto": return "Run to here" // or "Run this if selected process < active process"
      case "reset": return "Reset model"
      case "process": return "Add process"
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
      case "process": return true;
      default:
        throw "getActionEnabled(cmd) called with cmd=" + cmd;
    }
  }
  async handleClick(command) {
    //console.log(command)
    switch (command) {
      case "run":
        // test sync wait
        for (const item of [1, 2, 3]) {
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log(item);
        }
        //console.log('Done!');
        break;

    }
  }
}
