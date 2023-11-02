import { Component } from '@angular/core';
import { DataService } from '../../service/data.service';
import { InstallRPackagesDlgService } from './InstallRPackagesDlgService';

@Component({
  selector: 'InstallRPackagesDlg',
  templateUrl: './InstallRPackagesDlg.html',
  styleUrls: [],
})
export class InstallRPackagesDlg {
  constructor(
    private dataService: DataService,
    public service: InstallRPackagesDlgService
  ) {}
}
