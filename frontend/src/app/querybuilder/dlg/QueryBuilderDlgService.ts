import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueryBuilderDlgService {
  constructor() {}

  display: boolean = false;

  showDialog() {
    console.log('> ' + 'QueryBuilderDlgService showDialog');
    this.display = true;
  }
}
