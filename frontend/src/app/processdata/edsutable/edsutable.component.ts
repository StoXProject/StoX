import { Component, OnInit } from '@angular/core';
import { ProcessDataService } from './../../service/processdata.service'
import { ProjectService } from './../../service/project.service'
import { DataService } from './../../service/data.service'

@Component({
  selector: 'app-edsutable',
  templateUrl: './edsutable.component.html',
  styleUrls: ['./edsutable.component.css']
})
export class EdsutableComponent implements OnInit {

  constructor(public pds: ProcessDataService, private ps: ProjectService, private ds: DataService) { 
    //pds.acousticPSU.EDSU_PSU
  }

  ngOnInit(): void {
  }

}
