import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, } from '@angular/forms';

import { QueryBuilderComponent } from './module/query-builder.component';

import { QueryArrowIconDirective } from './module/query-arrow-icon.directive';
import { QueryFieldDirective } from './module/query-field.directive';
import { QueryInputDirective } from './module/query-input.directive';
import { QueryEntityDirective } from './module/query-entity.directive';
import { QueryOperatorDirective } from './module/query-operator.directive';
import { QueryButtonGroupDirective } from './module/query-button-group.directive';
import { QuerySwitchGroupDirective } from './module/query-switch-group.directive';
import { QueryRemoveButtonDirective } from './module/query-remove-button.directive';
import { QueryEmptyWarningDirective } from './module/query-empty-warning.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective
  ],
  exports: [
    QueryBuilderComponent,
    QueryInputDirective,
    QueryOperatorDirective,
    QueryFieldDirective,
    QueryEntityDirective,
    QueryButtonGroupDirective,
    QuerySwitchGroupDirective,
    QueryRemoveButtonDirective,
    QueryEmptyWarningDirective,
    QueryArrowIconDirective
  ]
})
export class QueryBuilderModule { }
