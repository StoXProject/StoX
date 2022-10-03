import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-busydlg',
  templateUrl: './busydlg.component.html',
  styleUrls: ['./busydlg.component.css']
})
export class BusydlgComponent implements OnInit {

  constructor(private ps: ProjectService) { }

  ngOnInit(): void {
  }

}
