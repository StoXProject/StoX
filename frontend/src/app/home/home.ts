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
    this.rpath = await this.dataService.getRPath();
    this.display = true;
  }

  apply(): void {
    console.log("apply");
    console.log("Posting rpath " + this.rpath)
    this.dataService.setRPath(this.rpath).toPromise().then(
      res => {
        console.log("Posting rpath, response " + res)
      }
    );
    this.display = false;
  }

  browse(): void {
    console.log("browse");
    this.dataService.browse(this.rpath).toPromise().then(
      res => {
        this.rpath = res;
      }
    );
  }
}
