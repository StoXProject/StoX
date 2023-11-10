import { Injectable } from '@angular/core';

@Injectable()
export class QueryBuilderDlgService {
  constructor() {}

  display: boolean = false;

  showDialog() {
    this.display = true;
  }
}
