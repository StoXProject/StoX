import { Component, OnInit } from '@angular/core';

import { Model } from '../data/model';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit {
  models: Model[];
  constructor(
    private dataService: DataService,
    public ps: ProjectService
  ) {}

  currentLabel: string = '';
  async ngOnInit() {}

  async activateMenu(model: Model) {
    if (model.modelName != this.currentLabel) {
      this.ps.selectedModel = model;
      this.currentLabel = model.modelName;
    }
  }
}
