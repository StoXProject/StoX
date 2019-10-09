import { Component, OnInit } from '@angular/core';
import { Project } from '../data/project';
import { ProjectService } from '../service/project.service';



@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})

export class ProjectComponent implements OnInit {
  projects: Project[];
  constructor(private ps: ProjectService) { 
  }

  ngOnInit() {
  }

}
