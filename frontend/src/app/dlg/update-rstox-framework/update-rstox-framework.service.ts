import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpdateRstoxFrameworkService {

  constructor() { }
  display: boolean = false;
  async showDialog() {
   /* console.log("showDialog");
    this.rpath = <string>await this.dataService.getRPath().toPromise();
    console.log("rpath retrieved: " + this.rpath);*/
    this.display = true;
}
}
