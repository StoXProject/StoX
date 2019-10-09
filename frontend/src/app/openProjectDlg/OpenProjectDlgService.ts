import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class OpenProjectDlgService {
    
    constructor() {}

    display: boolean = false;

    showDialog() {
        console.log("OpenProjectDialogService showDialog");
        this.display = true;
    }
}