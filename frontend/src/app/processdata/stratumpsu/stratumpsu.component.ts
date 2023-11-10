import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

import { Stratum_PSU } from './../../data/processdata';
import { ActiveProcessResult, PSUResult } from './../../data/runresult';
import { DataService } from './../../service/data.service';
import { ProcessDataService } from './../../service/processdata.service';
import { ProjectService } from './../../service/project.service';

@Component({
  selector: 'app-stratumpsu',
  templateUrl: './stratumpsu.component.html',
  styleUrls: ['./stratumpsu.component.scss'],
})
export class StratumpsuComponent implements OnInit {
  @Input() cm: ContextMenu;
  nodes: TreeNode[];
  m_selectedNode: TreeNode;

  private static asNode(id: string, type: string, children: TreeNode[]): TreeNode {
    return {
      label: id,
      data: { id, type },
      expandedIcon: 'rib absa ' + type + 'icon',
      collapsedIcon: 'rib absa ' + type + 'icon',
      children,
    };
  }

  constructor(
    private pds: ProcessDataService,
    private ps: ProjectService,
    private ds: DataService
  ) {
    // TODO: connect stratum from process data stratum, and then add psu after that
    pds.processDataSubject.subscribe((evt: string) => {
      switch (evt) {
        case 'stratum': {
          // Convert stratum to TreeNodes:
          if (pds.stratum != null) {
            this.nodes = pds.stratum.map((s: string) => {
              return StratumpsuComponent.asNode(s, 'stratum', []);
            });
          } else {
            this.nodes = null;
          }

          break;
        }

        case 'bioticAssignmentData':
        case 'acousticPSU': {
          // Connect Acoustic PSU to existing stratum TreeNodes:
          if (pds.acousticPSU != null && this.nodes != null) {
            this.nodes.forEach(n => {
              const psuNodes: TreeNode[] = pds.acousticPSU.Stratum_PSU.filter((spsu: Stratum_PSU) => spsu.Stratum === n.data.id).map((spsu: Stratum_PSU) => StratumpsuComponent.asNode(spsu.PSU, 'psu', []));

              n.children = psuNodes;
            });
          }

          break;
        }

        case 'bioticPSU': {
          // Connect Biotic PSU to existing stratum TreeNodes:
          if (pds.bioticPSU != null && this.nodes != null) {
            this.nodes.forEach(n => {
              const psuNodes: TreeNode[] = pds.bioticPSU.Stratum_PSU.filter((spsu: Stratum_PSU) => spsu.Stratum === n.data.id).map((spsu: Stratum_PSU) => StratumpsuComponent.asNode(spsu.PSU, 'psu', []));
              n.children = psuNodes;
            });
          }

          break;
        }
      }
    });
  }

  // Accessors for selected node
  set selectedNode(val: TreeNode) {
    this.m_selectedNode = val;
    switch (val.data.type) {
      case 'stratum': {
        this.pds.selectedPSU = null;
        this.pds.selectedStratum = val.data.id;
        break;
      }

      case 'psu': {
        this.pds.selectedStratum = val.parent.data.id;
        this.pds.selectedPSU = val.data.id;
        break;
      }
    }

    console.log('> ' + 'selected node' + val.data.id);
  }

  get selectedNode(): TreeNode {
    return this.m_selectedNode;
  }

  ngOnInit() {}

  async prepCm(node: TreeNode) {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    switch (node.data.type) {
      case 'stratum': {
        if (this.ps.iaMode == 'acousticPSU') {
          m.push({
            label: 'Add PSU',
            icon: 'rib absa psuicon',
            command: async event => {
              // psu a new psu node
              const res: PSUResult = this.ps.handleAPI(await this.ds.addAcousticPSU(node.data.id, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());

              if (res.PSU != null && res.PSU.length > 0) {
                node.children.push(StratumpsuComponent.asNode(res.PSU, 'psu', []));
              }
            },
          });
        }

        if (this.ps.iaMode == 'bioticPSU') {
          m.push({
            label: 'Add PSU',
            icon: 'rib absa psuicon',
            command: async event => {
              // psu a new psu node
              const res: PSUResult = this.ps.handleAPI(await this.ds.addBioticPSU(node.data.id, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
              if (res.PSU != null && res.PSU.length > 0) {
                node.children.push(StratumpsuComponent.asNode(res.PSU, 'psu', []));
              }
            },
          });
        }

        if (this.ps.iaMode == 'stratum') {
          m.push({
            label: 'Delete',
            icon: 'rib absa deleteicon',
            command: async event => {
              this.ps.handleAPI(<ActiveProcessResult>await this.ds.removeStratum(node.data.id, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
              this.ps.iaMode = 'stratum'; // trigger the gui
            },
          });
        }

        break;
      }

      case 'psu': {
        if (this.ps.iaMode == 'acousticPSU') {
          m.push({
            label: 'Delete',
            icon: 'rib absa deleteicon',
            command: async event => {
              this.ps.handleAPI(<ActiveProcessResult>await this.ds.removeAcousticPSU([node.data.id], this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
              this.ps.iaMode = 'acousticPSU'; // trigger the gui
            },
          });
        }

        if (this.ps.iaMode == 'bioticPSU') {
          m.push({
            label: 'Delete',
            icon: 'rib absa deleteicon',
            command: async event => {
              this.ps.handleAPI(<ActiveProcessResult>await this.ds.removeBioticPSU([node.data.id], this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
              this.ps.iaMode = 'bioticPSU'; // trigger the gui
            },
          });
        }

        break;
      }
    }

    this.cm.model = m;
  }

  async openCm(event, node: TreeNode) {
    this.selectedNode = node;
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm(node);
    if (this.cm.model.length > 0) {
      this.cm.show(event);
    } else {
      this.cm.hide();
    }

    return false;
  }
}
