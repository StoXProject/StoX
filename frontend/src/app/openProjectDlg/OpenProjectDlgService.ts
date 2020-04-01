import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class OpenProjectDlgService {
    
    constructor() {}

    display: boolean = false;

    projectPath: string = null;

    showDialog() {
        // console.log("OpenProjectDialogService showDialog");
        this.projectPath = null;
        this.display = true;
    }
}