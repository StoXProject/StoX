import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { Process } from '../data/process';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Model } from '../data/model';

import { SelectItem, Listbox } from 'primeng/primeng';
import { FormBuilder, FormControl, NgModel, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit/*, DoCheck*/   {
  shortcuts: ShortcutInput[] = [];

  processes: Process[];
  selectedProcesses: Process[];
  contextMenu: MenuItem[];

  constructor(private dataService: DataService, public ps: ProjectService) {
  }



  // @ViewChild('listBox', { static: true }) accessor: Listbox;
  // @ViewChild('listBox', { static: false, read: NgModel }) model: NgModel;
  //@ViewChild(ProcessComponent, { static: true }) myFormComponent: ProcessComponent;

  async ngOnInit() {
    //this.ngDoCheck();
    this.contextMenu = [{ label: "Run from here   " }];
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
    console.log("selected processes name " + this.selectedProcesses[0].processName);
    console.log("selected processes id " + this.selectedProcesses[0].processID);
    this.ps.setSelectedProcess(this.selectedProcesses[0]);
  }
  
  prepCm() {
    this.contextMenu = [
      { label: 'Run to here', icon: 'rib absa runtoicon', command: (event) => { } },
      { label: 'Delete', icon: 'rib absa emptyicon', command: (event) => { } },
      { label: 'Move up', icon: 'rib absa emptyicon', command: (event) => { } },
      { label: 'Move down', icon: 'rib absa emptyicon', command: (event) => { } },
      { label: 'Add process', icon: 'rib absa addprocessicon', command: (event) => { } }
    ];
  }
  openCm(event, cm) {
    console.log("preparing context menu" + event.target);
    event.preventDefault();
    event.stopPropagation();
    this.prepCm();
    cm.show(event);
    return false;
  }

}
