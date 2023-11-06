import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorUtils } from 'src/app/utils/errorUtils';
import { PathUtils } from 'src/app/utils/pathUtils';

import { FilePath } from '../../data/FilePath';
import { ProcessProperties } from '../../data/ProcessProperties';
import { MessageService } from '../../message/MessageService';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { FilePathDlgService } from './FilePathDlgService';

@Component({
  selector: 'FilePathDlg',
  templateUrl: './FilePathDlg.html',
  styleUrls: ['./FilePathDlg.css'],
})
export class FilePathDlg {
  dataSource: MatTableDataSource<FilePath> = new MatTableDataSource<FilePath>(this.service.paths);
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

  async addRow() {
    const filePath = await this.openFileDialog(true);
    if (filePath == null) {
      return;
    }

    const paths = <string[]>JSON.parse(filePath);
    const convertedPaths = paths.map(PathUtils.ConvertBackslash);

    //TODO: Add only unique paths
    for (let i = 0; i < convertedPaths.length; i++) {
      const path = convertedPaths[i];
      if (!this.service.paths.some(p => p.path === path)) {
        this.service.paths.push({ path: path });
      }
    }

    this.dataSource = new MatTableDataSource<FilePath>(this.service.paths);
    this.dataSource.filter = '';
  }

  async edit(currentFilePath: FilePath) {
    const filePath = await this.openFileDialog(false);

    if (filePath == null) {
      return;
    }

    const paths = <string[]>JSON.parse(filePath);
    const path = PathUtils.ConvertBackslash(paths[0]);
    currentFilePath.path = path;
  }

  delete(currentFilePath: FilePath) {
    const index: number = this.service.paths.findIndex(d => d === currentFilePath);
    this.service.paths.splice(index, 1);
    this.dataSource = new MatTableDataSource<FilePath>(this.service.paths);
  }

  async apply() {
    // check that all paths are filled and files exist
    for (let i = 0; i < this.service.paths.length; i++) {
      const { path } = this.service.paths[i];
      if (path == null) {
        this.setAndShowMessage('One or more file paths are empty!');

        return;
      }

      if (!(await this.fileExists(path))) {
        this.setAndShowMessage('File ' + path + ' does not exist');

        return;
      }
    }

    if (!PathUtils.ArePathsUnique(this.service.paths)) {
      this.setAndShowMessage('Paths to files are not unique!');

      return;
    }

    this.combinedPaths = this.service.combinedPaths();

    const stringifiedPaths = JSON.stringify(this.combinedPaths);
    const hasChanged = stringifiedPaths != this.service.currentPropertyItem.value;

    if (!hasChanged) {
      this.onHide();

      return;
    }

    this.service.currentPropertyItem.value = stringifiedPaths;

    const notNull = this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null;
    if (!notNull) {
      this.onHide();

      return;
    }

    try {
      const { groupName } = this.service.currentPropertyCategory;
      const { name, value } = this.service.currentPropertyItem;
      const { selectedProject, selectedProcessId, selectedModel } = this.ps;
      this.dataService
        .setProcessPropertyValue(groupName, name, value, selectedProject.projectPath, selectedModel.modelName, selectedProcessId)
        .toPromise()
        .then((s: ProcessProperties) => {
          this.ps.handleAPI(s);
        });
    } catch (error) {
      console.log('> ' + error.error);
      const firstLine = ErrorUtils.GetFirstLine(error);

      this.setAndShowMessage(firstLine);

      return;
    }

    this.onHide();
  }

  cancel() {
    this.onHide();
  }

  onHide() {
    this.service.display = false;
  }

  // Helpers
  // ________________________________________________________________________

  openFileDialog = async (multiSelect: boolean): Promise<string> => {
    const title = 'Select file' + (multiSelect ? 's' : '');
    const option = { properties: ['openFile', multiSelect ? 'multiSelections' : ''], title, defaultPath: this.ps.selectedProject.projectPath };
    const filePath = await this.dataService.browsePath(option).toPromise();

    return filePath;
  };

  setAndShowMessage(msg: string) {
    this.msgService.setMessage(msg);
    this.msgService.showMessage();
  }

  fileExists = async (path: string): Promise<boolean> => {
    const testFullPath = await this.dataService.fileExists(path).toPromise();

    if (testFullPath != null && testFullPath != 'true') {
      const testRelativePath = await this.dataService.fileExists(this.ps.selectedProject.projectPath + '/' + path).toPromise();

      if (testRelativePath != null && testRelativePath != 'true') {
        return false;
      }
    }

    return true;
  };
}
