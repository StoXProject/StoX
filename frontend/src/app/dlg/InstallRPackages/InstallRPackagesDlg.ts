import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from '../../service/data.service';
import { InstallRPackagesDlgService } from './InstallRPackagesDlgService';

@Component({
  selector: 'InstallRPackagesDlg',
  templateUrl: './InstallRPackagesDlg.html',
  styleUrls: []
})
export class InstallRPackagesDlg {
  constructor(private dataService: DataService, public service :InstallRPackagesDlgService ) {
  }
}
