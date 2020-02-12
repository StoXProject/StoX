import { Component, OnInit } from '@angular/core';
import { TreeNode, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

@Component({
  selector: 'app-stratumpsu',
  templateUrl: './stratumpsu.component.html',
  styleUrls: ['./stratumpsu.component.scss']
})
export class StratumpsuComponent implements OnInit {
  contextMenu: MenuItem[];

  constructor() { }
  files: TreeNode[];
  m_selectedFile: TreeNode;
  set selectedFile(val: TreeNode) {
    this.m_selectedFile = val;
    console.log("selected file" + val.data);
  }
  get selectedFile(): TreeNode {
    return this.m_selectedFile;
  }
  ngOnInit() {
    this.files = [
      {
        "label": "Stratum 1",
        "data": "1",
        "expandedIcon": "rib absa stratumicon",
        "collapsedIcon": "rib absa stratumicon",
        "children": [{
          "label": "T1",
          "data": "T1",
          "expandedIcon": "rib absa psuicon",
          "collapsedIcon": "rib absa psuicon"
          //"children": [{"label": "Expenses.doc", "icon": "fa fa-file-word-o", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "fa fa-file-word-o", "data": "Resume Document"}]
        },
        {
          "label": "T2",
          "data": "T2",
          "expandedIcon": "rib absa psuicon",
          "collapsedIcon": "rib absa psuicon"
          //"children": [{"label": "Expenses.doc", "icon": "fa fa-file-word-o", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "fa fa-file-word-o", "data": "Resume Document"}]
        }]
      },
      {
        "label": "Stratum 2",
        "data": "2",
        "expandedIcon": "rib absa stratumicon",
        "collapsedIcon": "rib absa stratumicon",
        "children": [{
          "label": "T3",
          "data": "T3",
          "expandedIcon": "rib absa psuicon",
          "collapsedIcon": "rib absa psuicon"
          //"children": [{"label": "Expenses.doc", "icon": "fa fa-file-word-o", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "fa fa-file-word-o", "data": "Resume Document"}]
        },
        {
          "label": "T4",
          "data": "T4",
          "expandedIcon": "rib absa psuicon",
          "collapsedIcon": "rib absa psuicon"
          //"children": [{"label": "Expenses.doc", "icon": "fa fa-file-word-o", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "fa fa-file-word-o", "data": "Resume Document"}]
        }]
      },
    ];
    this.selectedFile = this.files[1];

  }
  async prepCm(node: TreeNode) {
    // comment: add list of outputtablenames to runModel result. 
    let m: MenuItem[] = [];
    if (node.data == "1") {
      m.push(
        { label: 'Add PSU', icon: 'rib absa psuicon', command: (event) => { } }
      );
    }
    this.contextMenu = m;
  }
  async openCm(event, cm: ContextMenu, node: TreeNode) {
    this.selectedFile = node;
    //console.log("selecting process " + process.processID + " in contextmenu handler");
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm(node);
    if (this.contextMenu.length > 0) { 
      cm.show(event);
    } else {
      cm.hide();
    }
    return false;
  }
}
