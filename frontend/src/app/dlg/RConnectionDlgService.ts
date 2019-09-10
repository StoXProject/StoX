import { Injectable } from '@angular/core';
import { DataService } from '../data/data.service';


@Injectable({
    providedIn: 'root'
})
export class RConnectionDlgService {

    constructor(private dataService: DataService) {
    }

    display: boolean = false;
    rpath: string;

    async showDialog() {
        console.log("showDialog");
        this.rpath = <string>await this.dataService.getRPath().toPromise();
        console.log("rpath retrieved: " + this.rpath);
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
