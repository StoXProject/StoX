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
  handleClick(e, command) {
    console.log(command)
    switch (command) {
      case "run":
        console.log("run")
        break;

    }
  }
  buttons = [
    { cmd: "run", iclass: "runicon" },
    { cmd: "runnext", iclass: "runnexticon" },
    { cmd: "runfromhere", iclass: "runfromhereicon" },
    { cmd: "runto", iclass: "runtoicon" },
    { cmd: "reset", iclass: "reseticon" },
    { cmd: "process", iclass: "processicon" },
  ];
  public getActionTooltip(cmd : string) : string {
    switch (cmd) {
      case "run": return "Run model" // or "Continue model" if active process > -1
      case "runnext": return "Run next process";
      case "runfromhere": return "Run from here"
      case "runto": return "Run to here" // or "Run this if selected process < active process"
      case "reset": return "Reset model"
      case "process": return "Add process"
    }
  }
}
