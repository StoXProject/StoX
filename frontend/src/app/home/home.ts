import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from '../data/data.service';

@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  title = 'stox';
  constructor(private dataService: DataService) {
  }

  display: boolean = false;
  rpath: string = 'test1';
  async showDialog() {
    console.log("showDialog");
    this.rpath = await this.dataService.getRPath().toPromise();
    this.display = true;
  }

  async apply() {
    console.log("apply");
    console.log("Posting rpath " + this.rpath)
    var res = <string>await this.dataService.setRPath(this.rpath).toPromise();
    console.log("Posting rpath, response " + res)
    this.display = false;
  }

  async browse() {
    console.log("browse");
    this.rpath = await this.dataService.browse(this.rpath).toPromise();
  }
}
