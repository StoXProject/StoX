import { Injectable } from '@angular/core';

@Injectable()
export class SaveAsProjectDlgService {
  public display: boolean = false;

  async show() {
    this.display = true;
  }
}
