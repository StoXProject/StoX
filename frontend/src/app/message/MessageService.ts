import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  display: boolean = false;
  message: string;

  setMessage(message: string) {
    this.message = message;
  }

  showMessage() {
    this.display = true;
  }
}
