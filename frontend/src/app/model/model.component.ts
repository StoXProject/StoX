import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { Model } from '../data/model';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {
  models: Model[];
  constructor(private dataService: DataService, public ps: ProjectService) { }
  //items: MenuItem[] = [];
  currentLabel: string = '';
  // activeItem: MenuItem;
  //defaultActiveItem: MenuItem;
  //@ViewChild('menuItems', { static: false }) menu: MenuItem[];
  async ngOnInit() {
  //  this.ps.models.forEach(m => this.items.push({ label: m.displayName }));
  } 

  async activateMenu(model: Model) {
    if( model.modelName != this.currentLabel) {
      this.ps.selectedModel = model;
      this.currentLabel = model.modelName;
    }
  }
}
