import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { KeyboardShortcutsComponent, ShortcutInput } from 'ng-keyboard-shortcuts';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

import { OutputElement } from '../data/outputelement';
import { Process } from '../data/process';
import { ProcessOutputElement } from '../data/runresult';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { RunService } from '../service/run.service';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
})
export class ProcessComponent implements OnInit {
  shortcuts: ShortcutInput[] = [];

  @ViewChild('input', { static: false }) input: ElementRef;
  @Input() cm: ContextMenu;

  constructor(
    private ds: DataService,
    public ps: ProjectService,
    private rs: RunService,
    private renderer: Renderer2
  ) {}

  keydown(event: KeyboardEvent) {
    if (this.ps.processes != null && this.ps.processes.length > 0) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          const idx: number = event.key == 'ArrowDown' ? Math.min(this.ps.processes.length - 1, this.ps.getSelectedProcessIdx() + 1) : Math.max(0, this.ps.getSelectedProcessIdx() - 1);

          this.ps.selectedProcess = this.ps.processes[idx];
          break;
        }
      }
    }
  }

  async ngOnInit() {}

  ngAfterViewInit(): void {
    this.shortcuts.push({
      key: 'ctrl + f6',
      command: e => {
        this.rs.runToHere();
      },
    });
  }

  @ViewChild(KeyboardShortcutsComponent, { static: false }) private keyboard: KeyboardShortcutsComponent;
  showMessage(message: any) {
    console.log('> ' + message);
  }
  toggleBreak(p: Process) {
    //p.breakingui = !p.breakingui
  }

  async prepCm() {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    if (this.rs.canRunFromHere()) {
      m.push({
        label: 'Run from here',
        icon: 'rib absa runfromhereicon',
        command: event => {
          this.rs.runFromHere();
        },
      });
    }

    if (this.rs.canRunThis()) {
      m.push({
        label: 'Run this',
        icon: 'rib absa runthisicon',
        command: event => {
          this.rs.runThis();
        },
      });
    } else if (this.rs.canRunToHere()) {
      m.push({
        label: 'Run to here',
        icon: 'rib absa runtoicon',
        command: event => {
          this.rs.runToHere();
        },
      });
    }

    m.push({
      label: 'Delete',
      icon: 'rib absa deleteicon',
      command: event => {
        this.ps.removeSelectedProcess();
      },
    });

    m.push({
      label: 'Duplicate',
      icon: 'rib absa duplicate',
      command: event => {
        this.ps.duplicateSelectedProcess();
      },
    });

    if (this.ps.selectedProcess.hasBeenRun && this.rs.isProcessIdxRunnable(this.ps.getSelectedProcessIdx())) {
      const elements: ProcessOutputElement[] = await this.ds.getProcessOutputElements(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

      if (elements.length > 0) {
        m.push({
          label: 'Preview',
          icon: 'rib absa previewicon',
          items: elements.map(e => {
            return {
              label: e.elementName,
              icon: 'rib absa fileicon',
              command: async event => {
                let idx = this.ps.outputElements.findIndex(t => t.element.elementFullName == e.elementFullName);

                if (idx == -1) {
                  const oe: OutputElement = { processId: this.ps.selectedProcessId, element: e };

                  this.ps.outputElements.push(oe);
                  console.log('> ' + JSON.stringify(oe));
                  try {
                    this.ps.appStatus = 'Loading...';
                    await this.ps.resolveElementOutput(oe);
                  } finally {
                    this.ps.appStatus = null;
                  }

                  idx = this.ps.outputElements.length - 1;
                }

                this.ps.bottomViewActivator.next(1);
                this.ps.outputTableActivator.next(idx);
              },
            };
          }),
        });
      }

      const hasFileOutput: boolean = await this.ds.hasFileOutput(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

      if (hasFileOutput) {
        m.push({
          label: 'Show in folder',
          icon: 'rib absa foldericon',
          command: async event => {
            const outFolder: string = await this.ds.getProcessOutputFolder(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

            await this.ds.showinfolder(outFolder).toPromise();
          },
        });
      }
    }

    this.cm.model = m;
  }

  async openCm(event: MouseEvent, cm: ContextMenu, process: Process) {
    // TODO: Incorpoate dynamic ng-action-outlet with material. or support scrolling primeng menus
    // https://stackblitz.com/edit/ng-action-outlet-demo?file=src/app/app.component.ts
    this.ps.selectedProcess = process;
    //console.log("> " + "selecting process " + process.processID + " in contextmenu handler");
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm();
    cm.show(event);

    return false;
  }

  async drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex == event.currentIndex) {
      return;
    }

    console.log('> ' + event.previousIndex, event.currentIndex);
    const draggedProcessId: string = this.ps.processes[event.previousIndex].processID;

    const droppedProcessAfterIndex: number = event.previousIndex < event.currentIndex ? event.currentIndex : event.currentIndex - 1;

    const droppedProcessAfterId = droppedProcessAfterIndex >= 0 ? this.ps.processes[droppedProcessAfterIndex].processID : null;

    if (draggedProcessId != null) {
      console.log('> ' + 'dragging ' + draggedProcessId + ' to after ' + droppedProcessAfterId);
      this.ps.handleAPI(await this.ds.rearrangeProcesses(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, draggedProcessId, droppedProcessAfterId).toPromise());
    }
  }
}
