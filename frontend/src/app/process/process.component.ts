import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Process } from '../process';
import { ProjectService } from '../project.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuComponent } from 'ngx-contextmenu';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  shortcuts: ShortcutInput[] = [];
  constructor(private ps: ProjectService) {
  }

  ngOnInit() {
  }
  @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

  @ViewChild('input') input: ElementRef;
  ngAfterViewInit(): void {
     this.shortcuts.push(
       {
         key: "ctrl + t",
         preventDefault: true,
         command: e => console.log("clicked ", e.key)
       }
     );

    this.keyboard.select("cmd + f").subscribe(e => console.log(e));
  }
  @ViewChild(KeyboardShortcutsComponent) private keyboard: KeyboardShortcutsComponent;
  showMessage(message: any) {
    console.log(message);
  }
  toggleBreak(p: Process) {
    p.breakingui = !p.breakingui
  }
}
