import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';

@Component({
  selector: 'userlog',
  templateUrl: './userlog.component.html',
  styleUrls: ['./userlog.component.scss'],
})
export class UserLogComponent implements OnChanges {
  @Input() cm: ContextMenu;
  @Input() onTabChange: MatTabChangeEvent;
  @ViewChild('scrollMe', { static: true }) private myScrollContainer: ElementRef;
  constructor(
    public ds: DataService,
    public ps: ProjectService
  ) {
    ds.logSubject.subscribe(s => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;

      if (s == 'log-warning' || s == 'log-error') {
        ps.bottomViewActivator.next(0); // activate bottom view userlog
      }

      setTimeout(() => {
        self.scrollToBottom();
      }, 1);
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  async prepCm() {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    m.push({
      label: 'Clear log',
      icon: 'rib absa deleteicon',
      command: event => {
        this.ds.log.splice(0, this.ds.log.length);
      },
    });

    this.cm.model = m;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.onTabChange) {
      this.loadScrollPosition();
    }
  }

  loadScrollPosition() {
    const userlogScroll = localStorage.getItem('userlogScroll');
    if (userlogScroll) {
      this.myScrollContainer.nativeElement.scrollTop = userlogScroll;
    }
  }

  saveScroll = () => {
    const userlogScroll = this.myScrollContainer.nativeElement.scrollTop;
    localStorage.setItem('userlogScroll', userlogScroll);
  };

  async openCm(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    await this.prepCm();
    this.cm.show(event);

    return false;
  }
}
