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
  handleClick(e, command) {
    switch (command) {
      case "run":
        console.log("run")
        break;

    }
  }
}
