import { Component } from '@angular/core';

import { MessageService } from './MessageService';

@Component({
  selector: 'MessageDlg',
  templateUrl: './MessageDlg.html',
  styleUrls: [],
})
export class MessageDlg {
  constructor(public service: MessageService) {}
}
