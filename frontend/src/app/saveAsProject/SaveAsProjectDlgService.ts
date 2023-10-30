import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaveAsProjectDlgService {
  public display: boolean = false;

  async show() {
    this.display = true;
  }
}
