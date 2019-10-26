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
  private contextMenu: MenuItem[];

  constructor(private dataService: DataService, private ps: ProjectService) {
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
    console.log("selected processes " + this.selectedProcesses[0].processName);
    this.ps.setSelectedProcess(this.selectedProcesses[0]);
  }
  prepCm() {
    this.contextMenu = [
      { label: 'image(png)', icon: 'fa fa-cog fa-cog-style', command: (event) => { } },
      { label: 'List 1 (csv)', icon: 'fa icon_container_16 processicon', command: (event) => { } },
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
