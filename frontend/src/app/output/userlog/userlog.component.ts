import { Component, ElementRef, ViewChild, OnInit, Input } from '@angular/core';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { UserLogType } from '../../enum/enums'
import { ContextMenu, MenuItem } from 'primeng';


@Component({
    selector: 'userlog',
    templateUrl: './userlog.component.html',
    styleUrls: ['./userlog.component.scss']
})

export class UserLogComponent implements OnInit {
    @Input() cm: ContextMenu;
    //  projects: Project[];
    @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
    constructor(public ds: DataService, public ps: ProjectService) {
        ds.logSubject.subscribe(s => {
            var self = this;
            if (s == "log-warning" || s == "log-error") {
                ps.bottomViewActivator.next(0); // activate bottom view userlog
            }
            setTimeout(() => {
                self.scrollToBottom();
            }, 1);

        })
    }

    ngOnInit() {
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
            console.log("scrolled here")
        } catch (err) { }
    }
    async prepCm() {
        // comment: add list of outputtablenames to runModel result. 
        let m: MenuItem[] = [];
        m.push(
          { label: 'Clear log', icon: 'rib absa deleteicon', command: (event) => { this.ds.log.splice(0, this.ds.log.length) } }
        );
        this.cm.model = m;
      }
    
      async openCm(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        await this.prepCm();
        this.cm.show(event);
        return false;
      }
    }
