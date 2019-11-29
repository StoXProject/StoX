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
  constructor(private dataService: DataService, private ps: ProjectService) { }
  items: MenuItem[] = [];
  currentLabel: string = '';
  // activeItem: MenuItem;
  //defaultActiveItem: MenuItem;
  @ViewChild('menuItems', { static: false }) menu: MenuItem[];
  async ngOnInit() {
    // initialize MODELS and populate menu items
    //var t0 = performance.now();
    // this.models = <Model[]>JSON.parse(await this.dataService.getModelInfo().toPromise());
    this.models = <Model[]> await this.dataService.getModelInfo().toPromise();
    //var t1 = performance.now();
    //console.log("Call to dataService.getModelInfo() took " + (t1 - t0) + " milliseconds.");
    this.ps.setModels(this.models);
    //console.log("models " + this.models);
    this.models.forEach(m => this.items.push({ label: m.displayName }));
    //console.log("items " + this.items);
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
  async activateMenu(model: Model) {
    if( model.modelName != this.currentLabel) {
      this.ps.setSelectedModel(model.modelName);
      this.currentLabel = model.modelName;
    }
  }
}
