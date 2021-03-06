import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

import { DataService } from '../../service/data.service';
import { UserLogType } from '../../enum/enums'


@Component({
    selector: 'userlog',
    templateUrl: './userlog.component.html',
    styleUrls: ['./userlog.component.scss']
})

export class UserLogComponent implements OnInit {
    //  projects: Project[];
    @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
    constructor(public ds: DataService) {
        ds.logSubject.subscribe(s=>{
            var self = this;
            setTimeout(()=>{          
                self.scrollToBottom();
           }, 1);
        
        })
    }

    ngOnInit() {
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
