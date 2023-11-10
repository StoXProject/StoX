import { Component, OnInit } from '@angular/core';

import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.scss'],
})
export class StatusbarComponent implements OnInit {
  constructor(public ps: ProjectService) {}

  ngOnInit(): void {}
}
