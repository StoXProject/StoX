import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  stratum: string;
}

@Component({
  selector: 'app-stratum-name-dlg',
  templateUrl: './stratum-name-dlg.component.html'
})

export class StratumNameDlgComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<StratumNameDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

}
