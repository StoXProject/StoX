import { Component, OnInit, ViewChild } from "@angular/core";
import { ProcessDataService } from "./../../service/processdata.service";
import { ProjectService } from "./../../service/project.service";
import { DataService } from "./../../service/data.service";
import { EDSU_PSU } from "./../../data/processdata";
import { ActiveProcessResult } from "./../../data/runresult";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";

@Component({
  selector: "app-edsutable",
  templateUrl: "./edsutable.component.html",
  styleUrls: ["./edsutable.component.css"],
})
export class EdsutableComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;
  lastClickedIndex: number;

  constructor(
    public pds: ProcessDataService,
    private ps: ProjectService,
    private dataService: DataService
  ) {
    //pds.acousticPSU.EDSU_PSU
  }

  async ngOnInit() {
    this.pds.processDataSubject.subscribe(async (evt) => {
      switch (evt) {
        case "selectedPSU": {
          switch (this.ps.iaMode) {
            case "acousticPSU": {
              let selPSU = this.pds.selectedPSU;
              var indexOfLastValue: number =
                this.pds.acousticPSU.EDSU_PSU.reduce(
                  (iLast: number, x, i, arr) => (x.PSU == selPSU ? i : iLast),
                  undefined
                );
                this.viewPort.checkViewportSize();
                let nItems : number = this.viewPort.getViewportSize() / 18; // use this to calculate the 
                console.log("Viewport size: " + nItems);
                this.viewPort.scrollToIndex(indexOfLastValue - nItems / 2); 
              //console.log(this.pds.acousticPSU.EDSU_PSU[indexOfLastValue]);
            }
          }
        }
      }
    });
  }

  public getItemColor(item, shiftKey: boolean) {
    return item.PSU != null && item.PSU == this.pds.selectedPSU
      ? "#cce8ff"
      : "white";
  }

  async onItemClick(item, shiftDown) {
    switch (this.ps.iaMode) {
      case "acousticPSU": {
        let prevClickIndex = this.lastClickedIndex; // handle range selection with respect to last clicked index
        let clickedIndex = this.pds.acousticPSU.EDSU_PSU.findIndex(
          (item1) => item1 === item
        );
        this.lastClickedIndex = clickedIndex;
        if (!shiftDown || prevClickIndex == null) {
          prevClickIndex = clickedIndex;
        }
        let edsuPsu1: EDSU_PSU = this.pds.acousticPSU.EDSU_PSU[prevClickIndex];
        if (edsuPsu1 == null) {
          console.log("Error EDSU not found");
        }
        let psuToUse: string = edsuPsu1.PSU;
        if (prevClickIndex == clickedIndex) {
          psuToUse =
            edsuPsu1.PSU != this.pds.selectedPSU ? this.pds.selectedPSU : null;
        }
        let iFirst = Math.min(prevClickIndex, clickedIndex);
        let iLast = Math.max(prevClickIndex, clickedIndex);
        let changedEDSUs: string[] = [];
        for (let idx: number = iFirst; idx <= iLast; idx++) {
          let edsuPsu: EDSU_PSU = this.pds.acousticPSU.EDSU_PSU[idx];
          if (edsuPsu != null) {
            if (edsuPsu.PSU != psuToUse) {
              changedEDSUs.push(edsuPsu.EDSU);
              edsuPsu.PSU = psuToUse;
            }
          }
        }
        if (changedEDSUs.length > 0) {
          let res: ActiveProcessResult = this.ps.handleAPI(
            psuToUse != null
              ? await this.dataService
                  .addEDSU(
                    psuToUse,
                    changedEDSUs,
                    this.ps.selectedProject.projectPath,
                    this.ps.selectedModel.modelName,
                    this.ps.activeProcessId
                  )
                  .toPromise()
              : await this.dataService
                  .removeEDSU(
                    changedEDSUs,
                    this.ps.selectedProject.projectPath,
                    this.ps.selectedModel.modelName,
                    this.ps.activeProcessId
                  )
                  .toPromise()
          );
        }

        this.pds.processDataSubject.next("changedEDSU");
      }
    }
  }
}
