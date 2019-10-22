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
  MODELS: Model[];
  constructor(private dataService: DataService, private ps: ProjectService) { }
  items: MenuItem[] = [];
  currentLabel: string = '';
  // activeItem: MenuItem;
  //defaultActiveItem: MenuItem;
  @ViewChild('menuItems', { static: false }) menu: MenuItem[];
  async ngOnInit() {
    // initialize MODELS and populate menu items
    console.log("before getmodelinfo");
    this.MODELS = <Model[]>JSON.parse(await this.dataService.getModelInfo().toPromise());
    this.ps.setModels(this.MODELS);
    console.log("models " + this.MODELS);
    this.MODELS.forEach(m => this.items.push({ label: m.displayName }));
    console.log("items " + this.items);
    this.ps.setSelectedModel('Baseline');

    // if(this.ps.getSelectedProject != null) {
    //   this.PROCESSES_IN_MODEL = <Process[]>JSON.parse(await this.dataService.getTestProcesses().toPromise());
    //   console.log("processes " + this.PROCESSES_IN_MODEL);
    // }

    //this.activeItem = this.items[0];
    // this.items = [
    //   { label: 'Baseline' },
    //   { label: 'Statistics' },
    //   { label: 'Reports' }
    // ];
    //this.defaultActiveItem = this.items[0]; // set default active item
  }
  // async ngDoCheck() {
  //   this.accessor.registerOnChange = (fn: (val: any) => void) => {
  //     this.accessor.onModelChange = (val) => {
  //       console.log("on model change" + val);
  //       return fn(val);
  //     };
  //   }
  // }
  async activateMenu() {
    console.log(this.menu['activeItem'].label);
    console.log("this.currentLabel : " + this.currentLabel);
    if (this.menu['activeItem'].label != this.currentLabel) {
      this.ps.setSelectedModel(this.menu['activeItem'].label);
    }
    this.currentLabel = this.menu['activeItem'].label;
  }
}
