import { Component } from '@angular/core';
import {CreateProjectDialogService} from './create-project-dialog.service';

@Component({
    selector: 'CreateProjectDialog',
    templateUrl: './CreateProjectDialog.html',
    styleUrls: []
  })
export class CreateProjectDialog {
    
    constructor(public service: CreateProjectDialogService) {

    }
}
