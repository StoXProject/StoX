import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from '../service/data.service';
import { RConnectionDlgService } from '../dlg/RConnectionDlgService';
import { CreateProjectDialogService } from '../createProjectDlg/create-project-dialog.service'
import { OpenProjectDialogService } from '../openProjectDlg/openProjectDialogService'
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})

export class HomeComponent {
  title = 'stox';
  constructor(private rConnectionDlgService: RConnectionDlgService, 
    private createProjectDialogService: CreateProjectDialogService,
    private openProjectDialogService: OpenProjectDialogService,
    private dataService: DataService) {
  }
  items: MenuItem[];

  ngOnInit() {
    this.items = [{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    },
    {
      label: 'Create project...', command: e => this.createProjectDialogService.showDialog()
    },
    {
      label: 'Open project...', command: e => this.openProjectDialogService.showDialog()
    },    
    {
      label: 'Test...', command: e => {
        // this.dataService.getBioticData().pipe(map((resp: any) => {console.log("response", resp)}));
        //this.dataService.getBioticData().toPromise().then((st:any) => {console.log(st);});

        // this.dataService.runModel().subscribe( 
        //   response => {
        //     console.log("runModel() response : " + response);
        //   }
        // );

        // this.dataService.getOutputTable().subscribe( 
        //   response => {
        //     console.log("getOutputTable() response : " + response);
        //   }
        // );

        // this.dataService.getOutputTableNames().subscribe( 
        //   response => {
        //     console.log("getOutputTableNames() response : " + response);
        //   }
        // );   

        // this.dataService.isRstoxInstalled().subscribe( 
        //   response => {
        //     console.log("response : " + response);   

        //     var installed = JSON.parse(response);

        //     console.log("isRstoxInstalled() ? " + installed);

        //     if (!installed) {
        //       this.dataService.installRstox().subscribe( 
        //         response => {
        //           console.log("response : " + response);
        //           console.log("Rstox installed now.");
        //         });
        //     }
        //     // else {
        //     //   this.dataService.removeRstox().subscribe( 
        //     //     response => {
        //     //       console.log("response : " + response);
        //     //       console.log("Rstox removed now.");
        //     //     });
        //     // }
        //   }
        // ); 

        // this is to test error handling and show it in the console
        // this.dataService.makeItFail().subscribe(response => console.log("response : " + response));

        /*this.dataService.browse('c:/temp').toPromise().then(
          (response) => {
            console.log("response : " + response)
          }
        );*/
        // interactivemode: stratum, station, EDSU, acousticPSU, sweptareaPSU, assignment 
        // getmapdata(projectName, model, processid) - use model=Baseline
        // getinteractivemode(projectName, model, processid) - use model=Baseline
        // getInteractiveData(projectName, model, processid) process data - list with tables. - use model=Baseline 
        // gui control process run stepwise in loop and keeps track of last successfully run processid. (activeProcessId), 
        // activeprojectName, activeModel.


        // this.dataService.getAvailableTemplates().subscribe(
        //   response => {
        //     console.log("response : " + response)
        //   }
        // );
      }
    },
    {
      label: 'Mapmode stratum', command: e => {
        this.dataService.setMapMode('stratum');
      }
    },
    {
      label: 'Mapmode station', command: e => {
        this.dataService.setMapMode('station');
      }
    }

    ];
  }

}
