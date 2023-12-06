import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
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
export class ProcessComponent {
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
    if (!(this.ps.processes != null && this.ps.processes.length > 0)) {
      return;
    }

    let idx = null;
    const currentId = this.ps.getSelectedProcessIdx();
    switch (event.key) {
      case 'ArrowDown':
        idx = Math.min(this.ps.processes.length - 1, currentId + 1);
        break;

      case 'ArrowUp':
        idx = Math.max(0, currentId - 1);
        break;
    }

    if (idx != null) {
      this.ps.selectedProcess = this.ps.processes[idx];
    }
  }

  ngAfterViewInit(): void {
    this.shortcuts.push({
      key: 'ctrl + f6',
      command: _event => {
        this.rs.runToHere();
      },
    });
  }

  @ViewChild(KeyboardShortcutsComponent, { static: false }) private keyboard: KeyboardShortcutsComponent;
  showMessage(message: any) {
    console.log('> ' + message);
  }

  async prepCm() {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    // Generate menu items
    const runFromHere = {
      label: 'Run from here',
      icon: 'rib absa runfromhereicon',
      command: _event => {
        this.rs.runFromHere();
      },
    };
    const runThis = {
      label: 'Run this',
      icon: 'rib absa runthisicon',
      command: _event => {
        this.rs.runThis();
      },
    };
    const runToHere = {
      label: 'Run to here',
      icon: 'rib absa runtoicon',
      command: _event => {
        this.rs.runToHere();
      },
    };

    const deleteMenuItem = {
      label: 'Delete',
      icon: 'rib absa deleteicon',
      command: _event => {
        this.ps.removeSelectedProcess();
      },
    };
    const duplicate = {
      label: 'Duplicate',
      icon: 'rib absa duplicate',
      command: _event => {
        this.ps.duplicateSelectedProcess();
      },
    };

    // Add items to menu
    if (this.rs.canRunFromHere()) {
      m.push(runFromHere);
    }

    if (this.rs.canRunThis()) {
      m.push(runThis);
    } else if (this.rs.canRunToHere()) {
      m.push(runToHere);
    }

    m.push(deleteMenuItem);
    m.push(duplicate);

    if (this.ps.selectedProcess.hasBeenRun && this.rs.isProcessIdxRunnable(this.ps.getSelectedProcessIdx())) {
      const previewItems = await this.generatePreviewItems();
      if (previewItems) {
        m.push(previewItems);
      }

      const fileOutputItems = await this.generateFileOuputItems();
      if (fileOutputItems) {
        m.push(fileOutputItems);
      }
    }

    this.cm.model = m;
  }

  generateFileOuputItems = async (): Promise<MenuItem | null> => {
    const hasFileOutput: boolean = await this.ds.hasFileOutput(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

    if (!hasFileOutput) {
      return null;
    }

    return {
      label: 'Show in folder',
      icon: 'rib absa foldericon',
      command: async event => {
        const outFolder: string = await this.ds.getProcessOutputFolder(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

        await this.ds.showinfolder(outFolder).toPromise();
      },
    };
  };

  generatePreviewItems = async (): Promise<MenuItem | null> => {
    const elements: ProcessOutputElement[] = await this.ds.getProcessOutputElements(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();

    if (elements.length <= 0) {
      return null;
    }

    return {
      label: 'Preview',
      icon: 'rib absa previewicon',
      items: elements.map(e => {
        return {
          label: e.elementName,
          icon: 'rib absa fileicon',
          command: async _event => {
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
    };
  };

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
    const { currentIndex, previousIndex } = event;

    if (previousIndex == currentIndex) {
      return;
    }

    console.log('> ' + previousIndex, currentIndex);
    const draggedProcessId: string = this.ps.processes[previousIndex].processID;

    const droppedProcessAfterIndex: number = previousIndex < currentIndex ? currentIndex : currentIndex - 1;

    const droppedProcessAfterId = droppedProcessAfterIndex >= 0 ? this.ps.processes[droppedProcessAfterIndex].processID : null;

    if (draggedProcessId != null) {
      console.log('> ' + 'dragging ' + draggedProcessId + ' to after ' + droppedProcessAfterId);
      this.ps.handleAPI(await this.ds.rearrangeProcesses(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, draggedProcessId, droppedProcessAfterId).toPromise());
    }
  }

  isUsedAsInputBySelectedProcess = (iteratedProcessId): boolean => {
    const selectedProcess = this.ps.selectedProcess;

    if (!selectedProcess) {
      return false;
    }

    const { functionInputProcessIDs: inputIds } = selectedProcess;

    const inputIdsList = this.stringOrListToList(inputIds);

    return inputIdsList.includes(iteratedProcessId);
  };

  usesSelectedProcess = (iteratedProcessId): boolean => {
    const selectedProcess = this.ps.selectedProcess;

    if (!selectedProcess) {
      return false;
    }

    const { usedInProcessIDs: usedIds } = selectedProcess;

    const usedIdsList = this.stringOrListToList(usedIds);

    return usedIdsList.includes(iteratedProcessId);
  };

  stringOrListToList = (input: string | string[]): string[] => {
    return Array.isArray(input) ? input : [input];
  };
}
