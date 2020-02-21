import { Component, OnInit } from '@angular/core';
import { TreeNode, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ProcessDataService } from './../../service/processdata.service'
import { AcousticPSU, Stratum, Stratum_PSU } from './../../data/processdata'

@Component({
  selector: 'app-stratumpsu',
  templateUrl: './stratumpsu.component.html',
  styleUrls: ['./stratumpsu.component.scss']
})
export class StratumpsuComponent implements OnInit {
  contextMenu: MenuItem[];
  nodes: TreeNode[];
  m_selectedNode: TreeNode;

  private static asNode(id: string, type: string, children: TreeNode[]): TreeNode {
    return {
      "label": id,
      "data": id,
      "expandedIcon": "rib absa " + type + "icon",
      "collapsedIcon": "rib absa " + type + "icon",
      "children": children
    };
  }

  constructor(private pds: ProcessDataService) {
    pds.acousticPSUSubject.subscribe((evt: string) => {
      if (evt == "data") {
        // Convert Acoustic PSU to TreeNodes:
        this.nodes = pds.acousticPSU.Stratum
          .map((s: Stratum) => {
            let psuNodes: TreeNode[] = pds.acousticPSU.Stratum_PSU
              .filter((spsu: Stratum_PSU) => spsu.Stratum === s.Stratum)
              .map((spsu: Stratum_PSU) => StratumpsuComponent.asNode(spsu.PSU, "psu", []));
            return StratumpsuComponent.asNode(s.Stratum, "stratum", psuNodes);
          });
      }
    })
  }

  // Accessors for selected node
  set selectedNode(val: TreeNode) {
    this.m_selectedNode = val;
    this.pds.selectedPSU = val.data;
    console.log("selected node" + val.data);
  }

  get selectedNode(): TreeNode {
    return this.m_selectedNode;
  }

  ngOnInit() {

    this.nodes = [];
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
    this.selectedNode = node;
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
