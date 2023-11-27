import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { MessageDlgComponent, MessageDlgType } from '../messageDlg/messageDlg.component';

export interface DialogData {
  stratum: string;
  mapInteraction: MapInteraction;
}

@Component({
  selector: 'app-stratum-name-dlg',
  templateUrl: './stratum-name-dlg.component.html',
})
export class StratumNameDlgComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<StratumNameDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}
  async onOk() {
    if (this.data.stratum === '') {
      await MessageDlgComponent.showDlg(this.dialog, 'Error', 'Stratum name cannot be empty.', MessageDlgType.CLOSE);
    } else if (this.data.mapInteraction.stratumExists(this.data.stratum)) {
      await MessageDlgComponent.showDlg(this.dialog, 'Error', "Stratum name '" + this.data.stratum + "' is  already used.", MessageDlgType.CLOSE);
    } else {
      this.dialogRef.close(this.data.stratum);
    }
  }
}
