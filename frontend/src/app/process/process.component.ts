import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Process } from '../process';
import { ProjectService } from '../project.service';
import { ShortcutInput, ShortcutEventOutput, KeyboardShortcutsComponent } from "ng-keyboard-shortcuts";
import { ContextMenuComponent } from 'ngx-contextmenu';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss']
})
export class ProcessComponent implements OnInit {
  shortcuts: ShortcutInput[] = [];
  constructor(public ps: ProjectService) {
  }
  items: MenuItem[];
  //defaultActiveItem: MenuItem;
  @ViewChild('menuItems', { static: false }) menu: MenuItem[];

  ngOnInit() {
    this.items = [
      { label: 'Baseline' },
      { label: 'Statistics' },
      { label: 'Reports' }
    ];
    //this.defaultActiveItem = this.items[0]; // set default active item
  }
  activateMenu() {
    console.log(this.menu['activeItem']);
    //console.log(this.defaultActiveItem);
  }
  @ViewChild(ContextMenuComponent, { static: false }) public basicMenu: ContextMenuComponent;

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
}
