import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';

import { EDSU_PSU } from './../../data/processdata';
import { ActiveProcessResult } from './../../data/runresult';
import { DataService } from './../../service/data.service';
import { ProcessDataService } from './../../service/processdata.service';
import { ProjectService } from './../../service/project.service';

@Component({
  selector: 'app-edsutable',
  templateUrl: './edsutable.component.html',
  styleUrls: ['./edsutable.component.css'],
})
export class EdsutableComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  lastClickedIndex: number;

  constructor(
    public pds: ProcessDataService,
    private ps: ProjectService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    this.pds.processDataSubject.subscribe(async evt => {
      switch (evt) {
        case 'selectedPSU': {
          switch (this.ps.iaMode) {
            case 'acousticPSU': {
              const selPSU = this.pds.selectedPSU;
              const indexOfLastValue: number = this.pds.acousticPSU.EDSU_PSU.reduce((iLast: number, x, i, arr) => (x.PSU == selPSU ? i : iLast), undefined);
              this.viewPort.checkViewportSize();
              const nItems: number = this.viewPort.getViewportSize() / 18; // use this to calculate the
              console.log('> ' + 'Viewport size (acoustic): ' + nItems);
              this.viewPort.scrollToIndex(indexOfLastValue - nItems / 2);
              //console.log("> " + this.pds.acousticPSU.EDSU_PSU[indexOfLastValue]);
            }
            /*case "bioticPSU": {
              let selPSU = this.pds.selectedPSU;
              var indexOfLastValue: number =
                this.pds.bioticPSU.Station_PSU.reduce(
                  (iLast: number, x, i, arr) => (x.PSU == selPSU ? i : iLast),
                  undefined
                );
                this.viewPort.checkViewportSize();
                let nItems : number = this.viewPort.getViewportSize() / 18; // use this to calculate the 
                console.log("> " + "Viewport size (biotic): " + nItems);
                this.viewPort.scrollToIndex(indexOfLastValue - nItems / 2); 
              //console.log("> " + this.pds.bioticPSU.Station_PSU[indexOfLastValue]);
            }*/
          }
        }
      }
    });
  }

  public getItemColor(item, shiftKey: boolean) {
    return item.PSU != null && item.PSU == this.pds.selectedPSU ? '#cce8ff' : 'white';
  }

  async onItemClick(item, shiftDown) {
    // console.log('> ' + 'Item clicked: ' + item.EDSU + ' ' + item.PSU, this.ps.iaMode);
    switch (this.ps.iaMode) {
      case 'acousticPSU': {
        let prevClickIndex = this.lastClickedIndex; // handle range selection with respect to last clicked index

        const clickedIndex = this.pds.acousticPSU.EDSU_PSU.findIndex(item1 => item1 === item);

        this.lastClickedIndex = clickedIndex;
        if (!shiftDown || prevClickIndex == null) {
          prevClickIndex = clickedIndex;
        }

        const edsuPsu1: EDSU_PSU = this.pds.acousticPSU.EDSU_PSU[prevClickIndex];

        if (edsuPsu1 == null) {
          console.log('> ' + 'Error EDSU not found');
        }

        let psuToUse: string = edsuPsu1.PSU;

        if (prevClickIndex == clickedIndex) {
          psuToUse = edsuPsu1.PSU != this.pds.selectedPSU ? this.pds.selectedPSU : null;
        }

        const iFirst = Math.min(prevClickIndex, clickedIndex);

        const iLast = Math.max(prevClickIndex, clickedIndex);

        const changedEDSUs: string[] = [];

        for (let idx: number = iFirst; idx <= iLast; idx++) {
          const edsuPsu: EDSU_PSU = this.pds.acousticPSU.EDSU_PSU[idx];

          if (edsuPsu != null) {
            if (edsuPsu.PSU != psuToUse) {
              changedEDSUs.push(edsuPsu.EDSU);
              edsuPsu.PSU = psuToUse;
            }
          }
        }

        if (changedEDSUs.length > 0) {
          const res: ActiveProcessResult = this.ps.handleAPI(psuToUse != null ? await this.dataService.addEDSU(psuToUse, changedEDSUs, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise() : await this.dataService.removeEDSU(changedEDSUs, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
        }

        this.pds.processDataSubject.next('changedEDSU');
      }
    }
  }
}
