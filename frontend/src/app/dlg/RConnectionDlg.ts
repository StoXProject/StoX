import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from '../service/data.service';
import { RConnectionDlgService } from './RConnectionDlgService';

@Component({
  selector: 'RConnectionDlg',
  templateUrl: './RConnectionDlg.html',
  styleUrls: []
})
export class RConnectionDlg {
  constructor(private dataService: DataService, public service : RConnectionDlgService ) {
  }
}
