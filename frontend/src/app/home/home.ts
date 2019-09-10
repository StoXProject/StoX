import { Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DataService } from '../data/data.service';
import { RConnectionDlgService } from '../dlg/RConnectionDlgService';
import {MenuItem} from 'primeng/api';
@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})

export class HomeComponent {
  title = 'stox';
  constructor(private rConnectionDlgService: RConnectionDlgService) {
  }
  items: MenuItem[];

  ngOnInit() {
    this.items = [{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    }];
  }

}
