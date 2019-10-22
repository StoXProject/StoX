import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-run',
  templateUrl: './run.component.html',
  styleUrls: ['./run.component.scss']
})
export class RunComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  handleClick(e) { 
    console.log("run")
  }
}
