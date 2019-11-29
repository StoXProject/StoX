import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { ProjectService } from '../service/project.service';

@Component({
    selector: 'app-help',
    templateUrl: './HelpComponent.html',
    styleUrls: []
  })
  export class HelpComponent implements OnInit {
    
    constructor(public ps: ProjectService) {

    }

    async ngOnInit() { 
        
    }

  }