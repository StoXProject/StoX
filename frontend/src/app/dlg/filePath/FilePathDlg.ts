import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { FilePathDlgService } from './FilePathDlgService';
import { DataService } from '../../service/data.service';
import { FilePath } from '../../data/FilePath';
import { MessageService } from '../../message/MessageService';
import { ProjectService } from '../../service/project.service';
import { ProcessProperties } from '../../data/ProcessProperties';

@Component({
  selector: 'FilePathDlg',
  templateUrl: './FilePathDlg.html',
  styleUrls: ['./FilePathDlg.css'],
})
export class FilePathDlg implements OnInit {
  dataSource: MatTableDataSource<FilePath> = new MatTableDataSource<FilePath>(this.service.paths);
  // selection = new SelectionModel<FilePath>(true, []);

  displayedColumns = ['path', 'action'];

  combinedPaths: string[] = [];

  constructor(
    public service: FilePathDlgService,
    private dataService: DataService,
    private msgService: MessageService,
    private ps: ProjectService
  ) {
    service.pathDataObservable.subscribe(paths => {
      this.dataSource = new MatTableDataSource<FilePath>(paths);
    });
  }

  async ngOnInit() {}

  addRow() {
    this.service.paths.push({ path: null });
    this.dataSource = new MatTableDataSource<FilePath>(this.service.paths);
    // this.dataSource.data.push({path: null});
    this.dataSource.filter = '';
  }

  // removeSelectedRows() {
  //     this.selection.selected.forEach(item => {
  //       let index: number = this.service.paths.findIndex(d => d === item);
  //       console.log("> " + "index to remove : " + index);
  //       this.service.paths.splice(index, 1);
  //       this.dataSource = new MatTableDataSource<FilePath>(this.service.paths);
  //     });
  //     this.selection = new SelectionModel<FilePath>(true, []);
  // }

  /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //     const numSelected = this.selection.selected.length;
  //     const numRows = this.dataSource.data.length;
  //     return numSelected === numRows;
  // }

  // atLeastOneSelected() {
  //     return this.selection.selected.length > 0;
  // }

  // isOnlyOneSelected() {
  //     return this.selection.selected.length === 1;
  // }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  // this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.dataSource.data.forEach(row => this.selection.select(row));
  // }

  arePathsUnique() {
    var tmpArr = [];
    for (let obj = 0; obj < this.service.paths.length; obj++) {
      if (tmpArr.indexOf(this.service.paths[obj].path) < 0) {
        tmpArr.push(this.service.paths[obj].path);
      } else {
        return false;
      }
    }
    return true;
  }

  // async buildFilePath() {
  //     let currentFilePath: FilePath;
  //     currentFilePath = this.selection.selected[0];

  //     let options = {properties:['openFile'], title: 'Select file', defaultPath: this.ps.selectedProject.projectPath};

  //     let filePath = await this.dataService.browsePath(options).toPromise();

  //     // console.log("> " + "filePath : " + filePath);

  //     if(filePath != null) {
  //         let paths = <string[]>JSON.parse(filePath);

  //         //console.log("> " + "1st element : " + paths[0]);

  //         paths[0] = paths[0].replace(/\\/g, "/"); // convert backslash to forward

  //         //console.log("> " + "1st element : " + paths[0]);

  //         currentFilePath.path = paths[0];
  //     }
  // }

  async edit(currentFilePath: FilePath) {
    let options = { properties: ['openFile'], title: 'Select file', defaultPath: this.ps.selectedProject.projectPath };

    let filePath = await this.dataService.browsePath(options).toPromise();

    // console.log("> " + "filePath : " + filePath);

    if (filePath != null) {
      let paths = <string[]>JSON.parse(filePath);

      //console.log("> " + "1st element : " + paths[0]);

      paths[0] = paths[0].replace(/\\/g, '/'); // convert backslash to forward

      //console.log("> " + "1st element : " + paths[0]);

      currentFilePath.path = paths[0];
    }
  }

  delete(currentFilePath: FilePath) {
    let index: number = this.service.paths.findIndex(d => d === currentFilePath);
    // console.log("> " + this.service.paths.findIndex(d => d === currentFilePath));
    this.service.paths.splice(index, 1);
    this.dataSource = new MatTableDataSource<FilePath>(this.service.paths);
  }

  async apply() {
    // check that all paths are filled and files exist
    for (let i = 0; i < this.service.paths.length; i++) {
      if (this.service.paths[i].path == null) {
        this.msgService.setMessage('One or more file paths are empty!');
        this.msgService.showMessage();
        return;
      } else {
        // check file for existence
        let trial1 = await this.dataService.fileExists(this.service.paths[i].path).toPromise();

        if (trial1 != null && trial1 != 'true') {
          let trial2 = await this.dataService.fileExists(this.ps.selectedProject.projectPath + '/' + this.service.paths[i].path).toPromise();

          if (trial2 != null && trial2 != 'true') {
            this.msgService.setMessage('File ' + this.service.paths[i].path + ' does not exist');
            this.msgService.showMessage();
            return;
          }
        }
      }
    }

    // check that all paths are unique
    if (!this.arePathsUnique()) {
      this.msgService.setMessage('Paths to files are not unique!');
      this.msgService.showMessage();
      return;
    }

    // combine all paths into one combined array of paths
    this.combinedPaths = this.service.combinedPaths();

    if (JSON.stringify(this.combinedPaths) != this.service.currentPropertyItem.value) {
      this.service.currentPropertyItem.value = JSON.stringify(this.combinedPaths);

      if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
        try {
          this.dataService
            .setProcessPropertyValue(this.service.currentPropertyCategory.groupName, this.service.currentPropertyItem.name, this.service.currentPropertyItem.value, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
            .toPromise()
            .then((s: ProcessProperties) => {
              this.ps.handleAPI(s);
            });
        } catch (error) {
          console.log('> ' + error.error);
          var firstLine = error.error.split('\n', 1)[0];
          this.msgService.setMessage(firstLine);
          this.msgService.showMessage();
          return;
        }
      }
    }

    this.onHide();
  }

  cancel() {
    this.onHide();
  }

  onHide() {
    // this.selection.clear();
    this.service.display = false;
  }
}
