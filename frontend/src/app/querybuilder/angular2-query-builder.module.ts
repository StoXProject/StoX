import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QueryArrowIconDirective } from './module/query-arrow-icon.directive';
import { QueryBuilderComponent } from './module/query-builder.component';
import { QueryButtonGroupDirective } from './module/query-button-group.directive';
import { QueryEmptyWarningDirective } from './module/query-empty-warning.directive';
import { QueryEntityDirective } from './module/query-entity.directive';
import { QueryFieldDirective } from './module/query-field.directive';
import { QueryInputDirective } from './module/query-input.directive';
import { QueryOperatorDirective } from './module/query-operator.directive';
import { QueryRemoveButtonDirective } from './module/query-remove-button.directive';
import { QuerySwitchGroupDirective } from './module/query-switch-group.directive';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [QueryBuilderComponent, QueryInputDirective, QueryOperatorDirective, QueryFieldDirective, QueryEntityDirective, QueryButtonGroupDirective, QuerySwitchGroupDirective, QueryRemoveButtonDirective, QueryEmptyWarningDirective, QueryArrowIconDirective],
  exports: [QueryBuilderComponent, QueryInputDirective, QueryOperatorDirective, QueryFieldDirective, QueryEntityDirective, QueryButtonGroupDirective, QuerySwitchGroupDirective, QueryRemoveButtonDirective, QueryEmptyWarningDirective, QueryArrowIconDirective],
})
export class QueryBuilderModule {}
