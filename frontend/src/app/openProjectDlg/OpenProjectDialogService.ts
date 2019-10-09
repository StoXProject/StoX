import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class OpenProjectDialogService {
    
    constructor() {}

    display: boolean = false;

    showDialog() {
        console.log("OpenProjectDialogService showDialog");
        this.display = true;
    }
}