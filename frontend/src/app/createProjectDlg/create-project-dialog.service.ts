import { Injectable } from '@angular/core';
// import { Template } from '../data/Template';

@Injectable()
export class CreateProjectDialogService {
  constructor() {}

  display: boolean = false;

  async showDialog() {
    this.display = true;
  }
}
