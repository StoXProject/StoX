import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message: string;
  dlgType: number;
}

export enum MessageDlgType {
  YESNO = 0,
  CLOSE = 1,
}

@Component({
  selector: 'messageDlg',
  templateUrl: './messageDlg.component.html',
})
export class MessageDlgComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MessageDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    console.log('> ' + data);
  }

  ngOnInit() {}

  public static async showDlg(dialog: MatDialog, title: string, message: string, dlgType: MessageDlgType = MessageDlgType.YESNO) {
    const dialogRef = dialog.open(MessageDlgComponent, {
      width: '250px',
      disableClose: true,
      data: { title, message, dlgType },
    });

    return await dialogRef.afterClosed().toPromise();
  }
}
