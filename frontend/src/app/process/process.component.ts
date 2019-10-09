import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Process } from '../data/process';
import { ProjectService } from '../service/project.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuComponent } from 'ngx-contextmenu';
import { MenuItem } from 'primeng/api';
import { Model } from '../data/model';
import { DataService } from '../service/data.service';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'] 
})
export class ProcessComponent implements OnInit {
  shortcuts: ShortcutInput[] = [];
  MODELS: Model[];
  PROCESSES_IN_MODEL: Process[];
  selectedProcess: Process;

  constructor(private dataService: DataService) {
    // this.initializeModels();
  }
  items: MenuItem[] = [];
  //defaultActiveItem: MenuItem;
  @ViewChild('menuItems', { static: false }) menu: MenuItem[];

  async ngOnInit() {
    console.log("before getmodelinfo");
    this.MODELS = <Model[]> JSON.parse( await this.dataService.getModelInfo().toPromise() );
    console.log("models " + this.MODELS);
    this.MODELS.forEach(m => this.items.push({label: m.displayName}));
    console.log("items " + this.items);
    this.PROCESSES_IN_MODEL = <Process[]> JSON.parse( await this.dataService.getProcessesInModel().toPromise() );
    console.log("processes " + this.PROCESSES_IN_MODEL);

    // this.items = [
    //   { label: 'Baseline' },
    //   { label: 'Statistics' },
    //   { label: 'Reports' }
    // ];
    //this.defaultActiveItem = this.items[0]; // set default active item
  }

  async activateMenu() {
    console.log(this.menu['activeItem'].label);

  }

  @ViewChild(ContextMenuComponent, { static: false }) public basicMenu: ContextMenuComponent;

  @ViewChild('input', { static: false }) input: ElementRef;
  ngAfterViewInit(): void {
    this.shortcuts.push(
      {
        key: "ctrl + t",
        preventDefault: true,
        command: e => console.log("clicked ", e.key)
      }
    );

    //    this.keyboard.select("cmd + f").subscribe(e => console.log(e));
  }
  @ViewChild(KeyboardShortcutsComponent, { static: false }) private keyboard: KeyboardShortcutsComponent;
  showMessage(message: any) {
    console.log(message);
  }
  toggleBreak(p: Process) {
    //p.breakingui = !p.breakingui
  }

//   async initializeModels() { 
//     this.MODELS = <Model[]> JSON.parse( await this.dataService.getModelInfo().toPromise() ); 
//   }
 }
