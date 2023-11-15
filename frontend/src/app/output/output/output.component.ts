import { Component, Input, ViewChild } from '@angular/core';
import { MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { OutputElement } from 'src/app/data/outputelement';
import { SubjectAction } from 'src/app/data/subjectaction';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';

@Component({
  selector: 'output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss'],
})
export class OutputComponent {
  @Input() cm: ContextMenu;

  @ViewChild('outputTableGroup') outputTableGroup: MatTabGroup;

  constructor(
    public ps: ProjectService,
    public ds: DataService,
    private sanitizer: DomSanitizer
  ) {
    ps.outputTableActivator.subscribe({
      next: idx => {
        this.outputTableGroup.selectedIndex = idx;
      },
    });
    this.ps.processSubject.subscribe({
      next: (action: SubjectAction) => {
        switch (action.action) {
          case 'activate': {
            this.refreshData(action.data);
            break;
          }

          case 'remove': {
            this.removeData(action.data);
            break;
          }
        }
      },
    });
  }

  async prepCm(oe: OutputElement) {
    this.cm.model = this.getMenuItems(oe);
  }

  getMenuItems = (oe): MenuItem[] => {
    const m: MenuItem[] = [];

    m.push({
      label: 'Close',
      icon: 'rib absa closeicon',
      command: () => {
        this.closeElement(oe);
      },
    });

    if (this.ps.outputElements.length > 1) {
      m.push(
        {
          label: 'Close others',
          icon: 'rib absa emptyicon',
          command: () => {
            this.closeOtherElements(oe);
          },
        },
        {
          label: 'Close all',
          icon: 'rib absa emptyicon',
          command: () => {
            this.closeAllElements();
          },
        }
      );
    }

    return m;
  };

  async openCm(event: MouseEvent, oe: OutputElement) {
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm(oe);
    this.cm.show(event);

    return false;
  }

  closeElement(oe) {
    const idx = this.ps.outputElements.findIndex(e => e.element.elementName == oe.element.elementName);

    this.ps.outputElements.splice(idx, 1);
    if (this.ps.outputElements.length > 0) {
      this.outputTableGroup.selectedIndex = Math.max(idx + 1, this.ps.outputElements.length - 1);
    }
  }

  closeOtherElements(oe) {
    const idx = this.ps.outputElements.findIndex(e => e.element.elementName == oe.element.elementName);

    const l: number = this.ps.outputElements.length;

    if (idx < l - 1) {
      this.ps.outputElements.splice(idx + 1, l - 1 - idx);
    }

    if (idx > 0) {
      this.ps.outputElements.splice(0, idx - 0);
    }
  }

  closeAllElements() {
    const l: number = this.ps.outputElements.length;

    if (l > 0) {
      this.ps.outputElements.splice(0, l);
    }

    (this.outputTableGroup?._tabHeader as MatTabHeader).updatePagination();
  }

  refreshData(processId: string) {
    this.ps.outputElements
      .filter(oe => oe.processId == processId)
      .forEach(async oe => {
        await this.ps.resolveElementOutput(oe);
      });
  }

  removeData(processId: string) {
    this.ps.outputElements = this.ps.outputElements.filter(t => t.processId !== processId);
  }

  getItemOutput(item) {
    console.log('> ' + JSON.stringify(item.outputjson));

    return item.outputjson;
  }

  bypassURL(base64: string) {
    return base64 == null ? '' : this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${base64}`);
  }
}
