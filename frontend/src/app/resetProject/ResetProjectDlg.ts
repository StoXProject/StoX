import { Component, OnInit } from '@angular/core';

import { MessageService } from './../message/MessageService';
import { ResetProjectDlgService } from './ResetProjectDlgService';

@Component({
  selector: 'ResetProjectDlg',
  templateUrl: './ResetProjectDlg.html',
  styleUrls: ['./ResetProjectDlg.css'],
})
export class ResetProjectDlg implements OnInit {
  constructor(
    public service: ResetProjectDlgService,
    private msgService: MessageService
  ) {}

  async ngOnInit() {}

  async apply(continueWithoutSave: boolean) {
    try {
      if (this.service.ps.selectedProject?.projectPath != null && continueWithoutSave) {
        this.service.ps.openProject(this.service.ps.selectedProject.projectPath, false, true, true);
      }
    } catch (error) {
      this.msgService.setMessage(error);
      this.msgService.showMessage();
    } finally {
      this.service.display = false;
    }
  }
}
