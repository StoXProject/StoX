import { Component, OnInit } from '@angular/core';
import { TreeNode, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ProcessDataService } from './../../service/processdata.service'
import { ProjectService } from './../../service/project.service'
import { DataService } from './../../service/data.service'
import { AcousticPSU, Stratum, Stratum_PSU } from './../../data/processdata'
import { PSUResult } from './../../data/runresult'
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
      "data": { id: id, type: type },
      "expandedIcon": "rib absa " + type + "icon",
      "collapsedIcon": "rib absa " + type + "icon",
      "children": children/*,
      "type": type*/
    };
  }

  constructor(private pds: ProcessDataService, private ps: ProjectService, private ds: DataService) {
    // TODO: connect stratum from process data stratum, and then add psu after that
    pds.processDataSubject.subscribe((evt: string) => {

      if (evt == "acousticPSU") { 
        // Convert Acoustic PSU to TreeNodes:
        if (pds.acousticPSU != null && pds.acousticPSU.Stratum != null) {
          this.nodes = pds.acousticPSU.Stratum
            .map((s: Stratum) => {
              let psuNodes: TreeNode[] = pds.acousticPSU.Stratum_PSU
                .filter((spsu: Stratum_PSU) => spsu.Stratum === s.Stratum)
                .map((spsu: Stratum_PSU) => StratumpsuComponent.asNode(spsu.PSU, "psu", []));
              return StratumpsuComponent.asNode(s.Stratum, "stratum", psuNodes);
            });
        }
      } 
    })
  }


  // Accessors for selected node
  set selectedNode(val: TreeNode) {
    this.m_selectedNode = val;
    this.pds.selectedPSU = val.data.type == 'psu' ? val.data.id : null;
    console.log("selected node" + val.data.id);
  }

  get selectedNode(): TreeNode {
    return this.m_selectedNode;
  }

  ngOnInit() {
    // test
    //this.nodes = [StratumpsuComponent.asNode("1", "stratum", [StratumpsuComponent.asNode("PSU1", "psu", [])])];

    // this.m_selectedNode = this.nodes[0];
    //   this.nodes = [];
  }
  async prepCm(node: TreeNode) {
    // comment: add list of outputtablenames to runModel result. 
    let m: MenuItem[] = [];
    if (node.data.type == "stratum") {
      m.push(
        {
          label: 'Add PSU', icon: 'rib absa psuicon', command: async (event) => {
            // psu a new psu node
            let res: PSUResult = await this.ds.addAcousticPSU(node.data.id, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise();
            if (res.PSU != null && res.PSU.length > 0) {
              node.children.push(StratumpsuComponent.asNode(res.PSU, "psu", []))
              this.ps.selectedProject.saved = res.saved; 
            }
          }
        }
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
