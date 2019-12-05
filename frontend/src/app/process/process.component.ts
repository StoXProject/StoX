import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { Process } from '../data/process';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { RunService } from '../service/run.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Model } from '../data/model';
import { ProcessOutput } from '../data/processoutput';

import { SelectItem, Listbox, MenuItemContent } from 'primeng/primeng';
import { FormBuilder, FormControl, NgModel, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit/*, DoCheck*/ {
  shortcuts: ShortcutInput[] = [];

  //processes: Process[];
  //selectedProcesses: Process[];
  contextMenu: MenuItem[];

  constructor(private ds: DataService, public ps: ProjectService, private rs: RunService) {
  }

  async ngOnInit() {
    //this.ngDoCheck();
    this.contextMenu = [{ label: "Run from here   " }];
  }

  @ViewChild('input', { static: false }) input: ElementRef;
  ngAfterViewInit(): void {
    this.shortcuts.push(
      {
        key: "ctrl + f6",
        // preventDefault: true,
        command: e => {
          this.runToHere();
        }
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


  runToHere() {
    this.rs.runToHere(this.ps.getProcessIdx(this.ps.selectedProcess))
  }
  async prepCm() {
    // comment: add list of outputtablenames to runModel result. 
    let m: MenuItem[] = [];
    m.push(
      { label: 'Run to here', icon: 'rib absa runtoicon', command: (event) => { this.runToHere(); } },
      { label: 'Delete', icon: 'rib absa emptyicon', command: (event) => { } });
    if (this.ps.isRun(this.ps.selectedProcess)) {
      let tables: string[] = await this.ds.getProcessOutputTableNames(this.ps.getSelectedProject().projectPath,
        this.ps.selectedModel.modelName, this.ps.selectedProcess.processID).toPromise();
      if (tables.length > 0) {
        m.push({
          label: 'View output', icon: 'rib absa emptyicon', items:
            tables.map(e => {
              return {
                label: e, icon: 'rib absa emptyicon', command: async (event) => {
                  let out: ProcessOutput = await this.ds.getProcessOutput(this.ps.getSelectedProject().projectPath,
                    this.ps.selectedModel.modelName, this.ps.selectedProcess.processID, e).toPromise();
                  this.ps.outputTables.push({ table: e, output: out });
                }
              };
            })
        });
      }
    }
    m.push(
      { label: 'Move up', icon: 'rib absa emptyicon', command: (event) => { } },
      { label: 'Move down', icon: 'rib absa emptyicon', command: (event) => { } },
      { label: 'Add process', icon: 'rib absa addprocessicon', command: (event) => { } }
    );
    this.contextMenu = m;
  }
  async openCm(event, cm, process: Process) {
    this.ps.selectedProcess = process;
    //console.log("selecting process " + process.processID + " in contextmenu handler");
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm();
    cm.show(event);
    return false;
  }

}
