import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { Process } from '../data/process';
import { ProjectService } from '../service/project.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Model } from '../data/model';
import { DataService } from '../service/data.service';
import { SelectItem, Listbox } from 'primeng/primeng';
import { FormBuilder, FormControl, NgModel, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit/*, DoCheck*/   {
  shortcuts: ShortcutInput[] = [];
  MODELS: Model[];
  PROCESSES_IN_MODEL: Process[];
  selectedProcesses: Process[];
  private contextMenu: MenuItem[];

  constructor(private dataService: DataService, private ps: ProjectService) {
  }
  items: MenuItem[] = [];
  currentLabel: string = '';
  // activeItem: MenuItem;
  //defaultActiveItem: MenuItem;
  @ViewChild('menuItems', { static: false }) menu: MenuItem[];
  // @ViewChild('listBox', { static: true }) accessor: Listbox;
  // @ViewChild('listBox', { static: false, read: NgModel }) model: NgModel;
  //@ViewChild(ProcessComponent, { static: true }) myFormComponent: ProcessComponent;

  async ngOnInit() {
    //this.ngDoCheck();
    this.contextMenu = [{ label: "Run from here   " }];

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

  //@ViewChild(ContextMenuComponent, { static: false }) public basicMenu: ContextMenuComponent;

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

  onSelectedProcessesChanged(event) {
    // can be array of selected processes
    console.log("selected processes " + this.selectedProcesses[0].processName);
    this.ps.setSelectedProcess(this.selectedProcesses[0]);
  }
  prepCm() {
    this.contextMenu = [
      { label: 'image(png)', icon: 'fa-download', command: (event) => { } },
      { label: 'List 1 (csv)', icon: 'fa-download', command: (event) => { } },
      { label: 'List 2 (csv)', icon: 'fa-download', command: (event) => { } }
    ];
  }
  openCm(event, cm) {
    console.log("preparing context menu" + event.activeItem);
    event.preventDefault();
    event.stopPropagation();
    this.prepCm();
    cm.show(event);
    return false;
  }
}
