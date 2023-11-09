import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { DataService } from '../../service/data.service';
import { QueryBuilderConfig } from '../module/query-builder.interfaces';
import { RuleSet } from '../module/query-builder.interfaces';
import { ExpressionBuilderDlgService } from './../../expressionBuilder/ExpressionBuilderDlgService';
import { QueryBuilderDlgService } from './QueryBuilderDlgService';

@Component({
  selector: 'QueryBuilderDlg',
  templateUrl: './QueryBuilderDlg.html',
  styleUrls: ['./QueryBuilderDlg.css'],
})
export class QueryBuilderDlg implements OnInit {
  async ngOnInit() {}

  public queryCtrl: FormControl;

  public config: QueryBuilderConfig = <QueryBuilderConfig>{};
  public query: RuleSet = { condition: '&', rules: [] };

  public currentConfig: QueryBuilderConfig;
  public allowRuleset: boolean = true;
  public allowCollapse: boolean;
  public persistValueOnFieldChange: boolean = false;

  public tableName: string = '';

  constructor(
    public service: QueryBuilderDlgService,
    private formBuilder: FormBuilder,
    public exprBuilderService: ExpressionBuilderDlgService,
    private dataService: DataService
  ) {
    console.log('> ' + 'start QueryBuilderDlg constructor');

    try {
      this.queryCtrl = this.formBuilder.control(this.query);
      this.currentConfig = this.config;

      this.exprBuilderService.tableExpressionObservable.subscribe(cte => {
        if (cte != null) {
          this.tableName = cte.tableName;
        }
      });

      this.exprBuilderService.currentConfig.subscribe(config => {
        console.log('> ' + 'currentConfig : ', config);
        this.adjustConfig(config);
        this.currentConfig = config;
      });

      this.exprBuilderService.currentQuery.subscribe(query => {
        this.query = query;
        console.log('> ' + 'query : ' + JSON.stringify(this.query));
      });
    } catch (error) {
      console.log('> ' + error);
    }
  }

  async apply() {
    console.log('> ' + 'current query : ' + JSON.stringify(this.query));

    // a call to dataservice to get R expression for this.query
    let rExpression = <string>await this.dataService.json2expression(this.query).toPromise();

    console.log('> ' + "rExpression : '" + rExpression + "'");

    if (rExpression != null && rExpression.trim() == '') {
      rExpression = null;
    }

    if (this.exprBuilderService.getCurrentTableExpression() != null && rExpression != null) {
      this.exprBuilderService.getCurrentTableExpression().expression = rExpression;
    }

    this.service.display = false;
  }

  adjustConfig(paramConfig: QueryBuilderConfig) {
    // console.log("> " + "adjusted config : ");
    for (const key in paramConfig) {
      const value = paramConfig[key];
      // console.log("> " + "key : " + key + ", value : " + value);

      for (const key2 in value) {
        const value2 = value[key2];
        // console.log("> " + "key2 : " + key2 + ", value2 : " + value2);

        for (const key3 in value2) {
          const value3 = value2[key3];
          // console.log("> " + "key3 : " + key3 + ", value3 : " + value3);

          if (key3 == 'options') {
            const optionsLength = value3.length;
            // console.log("> " + "option length : " + optionsLength);

            if (optionsLength > 0) {
              // value2["type"] = "category";
              value2['multiselect'] = true;
              // console.log("> " + "type changed to 'category'!");
              // console.log("> " + "multiselect is true!");
            } else {
              delete value2[key3];
              // console.log("> " + "empty options deleted!");
            }
          }
        }
      }
    }
  }
}
