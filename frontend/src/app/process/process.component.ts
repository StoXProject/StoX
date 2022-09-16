import { Component, ElementRef, ViewChild, OnInit, Renderer2, HostListener, DoCheck, AfterViewInit } from '@angular/core';
import { Process } from '../data/process';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { RunService } from '../service/run.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { Model } from '../data/model';
import { ProcessTableOutput } from '../data/processtableoutput';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

//import { SelectItem, Listbox, MenuItemContent } from 'primeng/primeng';
import { FormBuilder, FormControl, NgModel, FormGroup, Validators } from '@angular/forms';
import { ProcessOutputElement, ProcessTableResult } from '../data/runresult';
import { OutputElement } from '../data/outputelement';
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
  //@HostListener('document:keydown.control.y')
  keydown(event: KeyboardEvent) {
    if (this.ps.processes != null && this.ps.processes.length > 0) {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          let idx: number = event.key == "ArrowDown" ?
            Math.min(this.ps.processes.length - 1, this.ps.getSelectedProcessIdx() + 1)
            : Math.max(0, this.ps.getSelectedProcessIdx() - 1);
          this.ps.selectedProcess = this.ps.processes[idx];
          break;
        }
      }
    }
  }

  constructor(private ds: DataService, public ps: ProjectService, private rs: RunService,
    private renderer: Renderer2) {
  }

  async ngOnInit() {
    //this.ngDoCheck();
    this.contextMenu = [{ label: "Run from here   " }];
    //  this.renderer.listen(document, 'keydown.control.y', (event)=>{this.doSomething()})
  }

  @ViewChild('input', { static: false }) input: ElementRef;
  ngAfterViewInit(): void {
    this.shortcuts.push(
      {
        key: "ctrl + f6",
        // preventDefault: true,
        command: e => {
          this.rs.runToHere();
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


  async prepCm() {
    // comment: add list of outputtablenames to runModel result. 
    let m: MenuItem[] = [];
    if (this.rs.canRunFromHere()) {
      m.push(
        { label: 'Run from here', icon: 'rib absa runfromhereicon', command: (event) => { this.rs.runFromHere(); } });
    }
    m.push(
      { label: this.rs.canRunThis() ? 'Run this' : 'Run to here', icon: 'rib absa runtoicon', command: (event) => { this.rs.runToHere(); } },
      { label: 'Delete', icon: 'rib absa emptyicon', command: (event) => { this.ps.removeSelectedProcess(); } }
    );
    if (this.ps.selectedProcess.hasBeenRun) {
      let elements: ProcessOutputElement[] = await this.ds.getProcessOutputElements(this.ps.selectedProject.projectPath,
        this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();
      if (elements.length > 0) {
        m.push({
          label: 'Preview', icon: 'rib absa emptyicon', items:
            elements.map(e => {
              return {
                label: e.elementName, icon: 'rib absa emptyicon',  
                command: async (event) => {
                  let idx = this.ps.outputElements.findIndex(t => t.element.elementFullName == e.elementFullName);
                  if (idx == -1) {
                    let oe : OutputElement = { processId: this.ps.selectedProcessId, element: e};
                    this.ps.outputElements.push(oe);
                    console.log(JSON.stringify(oe))
                    await this.ps.resolveElementOutput(oe);
                  }
                  idx = this.ps.outputElements.length - 1;
                  this.ps.bottomViewActivator.next(1)
                  this.ps.outputTableActivator.next(idx)
                }
              };
            })
        });
      }
      let hasFileOutput: boolean = await this.ds.hasFileOutput(this.ps.selectedProject.projectPath,
        this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();
        if(hasFileOutput) {
          m.push(
            { label: 'Show in folder', icon: 'rib absa emptyicon', command: async (event) => {
              let outFolder: string = await this.ds.getProcessOutputFolder(this.ps.selectedProject.projectPath,
                this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();
                await this.ds.showinfolder(outFolder).toPromise();
    
            } }
          );
        }
    }
    // m.push(
    //   { label: 'Move up', icon: 'rib absa emptyicon', command: (event) => { } },
    //   { label: 'Move down', icon: 'rib absa emptyicon', command: (event) => { } },
    //   { label: 'Add process', icon: 'rib absa addprocessicon', command: (event) => { this.ps.addProcess(); } }
    // );
    this.contextMenu = m;
  }
  async openCm(event: MouseEvent, cm: ContextMenu, process: Process) {
    // TODO: Incorpoate dynamic ng-action-outlet with material. or support scrolling primeng menus
    // https://stackblitz.com/edit/ng-action-outlet-demo?file=src/app/app.component.ts
    this.ps.selectedProcess = process;
    //console.log("selecting process " + process.processID + " in contextmenu handler");
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm();
    cm.show(event);
    return false;
  }

 
  async drop(event: CdkDragDrop<string[]>) {
    if(event.previousIndex == event.currentIndex) {
      return;
    }
    console.log(event.previousIndex, event.currentIndex);
    let draggedProcessId : string= this.ps.processes[event.previousIndex].processID;
    let droppedProcessAfterIndex : number = event.previousIndex < event.currentIndex ? event.currentIndex : event.currentIndex - 1;
    let droppedProcessAfterId = droppedProcessAfterIndex >= 0 ? this.ps.processes[droppedProcessAfterIndex].processID : null; 
    if (draggedProcessId != null) {
      console.log("dragging " + draggedProcessId + " to after " + droppedProcessAfterId);
      let pr: ProcessTableResult = this.ps.handleAPI(await this.ds.rearrangeProcesses(this.ps.selectedProject.projectPath, 
        this.ps.selectedModel.modelName, draggedProcessId, droppedProcessAfterId).toPromise());
    }
  }
}
