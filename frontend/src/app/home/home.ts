import { ResetProjectDlgService } from './../resetProject/ResetProjectDlgService';
import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
// import { Observable, of } from 'rxjs';
// import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { RConnectionDlgService } from '../dlg/RConnectionDlgService';
import { CreateProjectDialogService } from '../createProjectDlg/create-project-dialog.service';
import { OpenProjectDlgService } from '../openProjectDlg/OpenProjectDlgService';
// import { ExpressionBuilderDlgService } from '../expressionBuilder/ExpressionBuilderDlgService';
// import { DefinedColumnsService } from '../dlg/definedColumns/DefinedColumnsService';
// import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { MenuItem } from 'primeng/api';
import { DataService } from '../service/data.service';
import { SaveAsProjectDlgService } from '../saveAsProject/SaveAsProjectDlgService';

@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})

export class HomeComponent {
  title = 'StoX';
  stoxVersion: string;
  rstoxAPIVersion: string;
  constructor(private rConnectionDlgService: RConnectionDlgService,
    private createProjectDialogService: CreateProjectDialogService,
    private openProjectDlgService: OpenProjectDlgService,
    public ps: ProjectService,
    private saveProjectAs: SaveAsProjectDlgService, private resetProject: ResetProjectDlgService,
    private ds: DataService
    /*,
    private dataService: DataService, 
    private expressionBuilderDlgService: ExpressionBuilderDlgService,
    private testDlgService: QueryBuilderDlgService, 
    private definedColumns: DefinedColumnsService
    ,
    private quBuilderDlgService: QueryBuilderDlgService */) {

    // document.addEventListener('touchstart', function(){}, {passive: false});
  }
  items?: MenuItem[];

  async ngOnInit() {
    this.stoxVersion = '2.9.6';
    this.rstoxAPIVersion = await this.ds.getRstoxAPIVersion().toPromise();
    this.items = [{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    },
    {
      label: 'Create project...', command: e => this.createProjectDialogService.showDialog()
    },
    {
      label: 'Open project...', command: e => this.openProjectDlgService.showDialog()
    },
    // {
    //   label: 'Test defined columns ...', command: e => this.definedColumns.showDialog()
    // },
    // {
    //   label: 'Test query builder...', command: e => this.testDlgService.showDialog()
    // },    
    // {
    //   label: 'Test...', command: e => {
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
    //   }
    // },
    {
      label: 'Save project as...', command: e => {
        this.saveProjectAs.show();
      }
    },
    {
      label: 'Reset project', command: e => {
        this.resetProject.checkSaved();
      }
    }

    ];
  }


}
