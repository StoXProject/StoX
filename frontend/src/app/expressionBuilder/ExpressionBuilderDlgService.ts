import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
  })
export class ExpressionBuilderDlgService {
    constructor() {}

    public display: boolean = false;
  
    async showDialog() {
        console.log("in ExpressionBuilderDlgService.showDialog()");
        this.display = true;
    }
}