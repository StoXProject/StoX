import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message : string;
}

export enum MessageDlgType {"YESNO", "CLOSE"};

@Component({
  selector: 'messageDlg',
  templateUrl: './messageDlg.component.html'
})

export class MessageDlgComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MessageDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  public static async showDlg(dialog: MatDialog, title : string, message : string, dlgType : MessageDlgType = MessageDlgType.YESNO) {
    const dialogRef = dialog.open(MessageDlgComponent, {
      width: '250px',
      disableClose: true,
      data: { title: title, message: message, dlgType: dlgType }
    });
    return await dialogRef.afterClosed().toPromise();
  }
}
 