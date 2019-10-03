import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';
// import { Template } from '../data/Template';

@Injectable({
  providedIn: 'root'
})
export class CreateProjectDialogService {

  constructor() {}

  display: boolean = false;

  async showDialog() {
      this.display = true;
  }
}
