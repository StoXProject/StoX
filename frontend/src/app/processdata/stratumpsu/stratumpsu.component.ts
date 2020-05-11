import { Component, OnInit } from '@angular/core';
import { TreeNode, MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { ProcessDataService } from './../../service/processdata.service'
import { ProjectService } from './../../service/project.service'
import { DataService } from './../../service/data.service'
import { AcousticPSU, Stratum, Stratum_PSU } from './../../data/processdata'
import { PSUResult, ActiveProcessResult } from './../../data/runresult'
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

      switch (evt) {
        case "stratum": {
          // Convert stratum to TreeNodes:
          if (pds.stratum != null) {
            this.nodes = pds.stratum
              .map((s: string) => {
                return StratumpsuComponent.asNode(s, "stratum", []);
              });
          } else {
            this.nodes = null; 
          }
          break;
        }
        case "acousticPSU": {
          // Connect Acoustic PSU to existing stratum TreeNodes:
          if (pds.acousticPSU != null && this.nodes != null) {
            this.nodes.forEach(n => {
              let psuNodes: TreeNode[] = pds.acousticPSU.Stratum_PSU
                .filter((spsu: Stratum_PSU) => spsu.Stratum === n.data.id)
                .map((spsu: Stratum_PSU) => StratumpsuComponent.asNode(spsu.PSU, "psu", []));
              n.children = psuNodes;
            });
          }
          break;
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
            let res: PSUResult = this.ps.handleAPI(await this.ds.addAcousticPSU(node.data.id, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
            if (res.PSU != null && res.PSU.length > 0) {
              node.children.push(StratumpsuComponent.asNode(res.PSU, "psu", []))
            }
          }
        }, {
        label: 'Delete', icon: 'rib absa deleteicon', command: async (event) => {
          // psu a new psu node
          let res: ActiveProcessResult = this.ps.handleAPI(<ActiveProcessResult>await this.ds.removeStratum(node.data.id, 
            this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
          this.ps.iaMode = "stratum"; // trigger the gui
          //this.nodes.splice(this.nodes.indexOf(node), 1);
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
