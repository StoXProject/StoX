import { Component, OnInit } from '@angular/core';
//import { Project } from '../../data/project';
import { ProjectService } from '../../service/project.service';



@Component({
  selector: 'userlog',
  templateUrl: './userlog.component.html',
  styleUrls: ['./userlog.component.scss']
})

export class UserLogComponent implements OnInit {
//  projects: Project[];
  constructor(private ps: ProjectService) { 
  }

  ngOnInit() {
  }

}
