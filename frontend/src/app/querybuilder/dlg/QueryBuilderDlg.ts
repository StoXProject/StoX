import { ExpressionBuilderDlgService } from './../../expressionBuilder/ExpressionBuilderDlgService';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig } from '../module/query-builder.interfaces';
import { RuleSet } from '../module/query-builder.interfaces';
import { Component, OnInit } from '@angular/core';
import { QueryBuilderDlgService } from './QueryBuilderDlgService';
import { DataService } from '../../service/data.service';

@Component({
    selector: 'TestDlg',
    templateUrl: './QueryBuilderDlg.html',
    styleUrls: ['./QueryBuilderDlg.css']
})
export class QueryBuilderDlg  implements OnInit {

    async ngOnInit() {
        
    }

    public queryCtrl: FormControl;

    // public bootstrapClassNames: QueryBuilderClassNames = {
    //   removeIcon: 'fa fa-minus',
    //   addIcon: 'fa fa-plus',
    //   arrowIcon: 'fa fa-chevron-right px-2',
    //   button: 'btn',
    //   buttonGroup: 'btn-group',
    //   rightAlign: 'order-12 ml-auto',
    //   switchRow: 'd-flex px-2',
    //   switchGroup: 'd-flex align-items-center',
    //   switchRadio: 'custom-control-input',
    //   switchLabel: 'custom-control-label',
    //   switchControl: 'custom-control custom-radio custom-control-inline',
    //   row: 'row p-2 m-1',
    //   rule: 'border',
    //   ruleSet: 'border',
    //   invalidRuleSet: 'alert alert-danger',
    //   emptyWarning: 'text-danger mx-auto',
    //   operatorControl: 'form-control',
    //   operatorControlSize: 'col-auto pr-0',
    //   fieldControl: 'form-control',
    //   fieldControlSize: 'col-auto pr-0',
    //   entityControl: 'form-control',
    //   entityControlSize: 'col-auto pr-0',
    //   inputControl: 'form-control',
    //   inputControlSize: 'col-auto'
    // };
  
    // public query: RuleSet = {
    //   condition: 'and',
    //   rules: [
    //     {field: 'age', operator: '<='},
    //     {field: 'birthday', operator: '=', value: new Date()},
    //     {
    //       condition: 'or',
    //       rules: [
    //         {field: 'gender', operator: '='},
    //         {field: 'occupation', operator: 'in'},
    //         {field: 'school', operator: 'is null'},
    //         {field: 'notes', operator: '='}
    //       ]
    //     },
    //     {field: 'age', operator: '=', value: 40},
    //   ]
    // };
  
    // public entityConfig: QueryBuilderConfig = {
    //   entities: {
    //     physical: {name: 'Physical Attributes'},
    //     nonphysical: {name: 'Nonphysical Attributes'}
    //   },
    //   fields: {
    //     age: {name: 'Age', type: 'number', entity: 'physical'},
    //     gender: {
    //       name: 'Gender',
    //       entity: 'physical',
    //       type: 'category',
    //       options: [
    //         {name: 'Male', value: 'm'},
    //         {name: 'Female', value: 'f'}
    //       ]
    //     },
    //     name: {name: 'Name', type: 'string', entity: 'nonphysical'},
    //     notes: {name: 'Notes', type: 'textarea', operators: ['=', '!='], entity: 'nonphysical'},
    //     educated: {name: 'College Degree?', type: 'boolean', entity: 'nonphysical'},
    //     birthday: {name: 'Birthday', type: 'date', operators: ['=', '<=', '>'],
    //       defaultValue: (() => new Date()), entity: 'nonphysical'
    //     },
    //     school: {name: 'School', type: 'string', nullable: true, entity: 'nonphysical'},
    //     occupation: {
    //       name: 'Occupation',
    //       entity: 'nonphysical',
    //       type: 'category',
    //       options: [
    //         {name: 'Student', value: 'student'},
    //         {name: 'Teacher', value: 'teacher'},
    //         {name: 'Unemployed', value: 'unemployed'},
    //         {name: 'Scientist', value: 'scientist'}
    //       ]
    //     }
    //   }
    // };
  
    // public config: QueryBuilderConfig = {
    //   fields: {
    //     age: {name: 'Age', type: 'number'},
    //     gender: {
    //       name: 'Gender',
    //       type: 'category',
    //       options: [
    //         {name: 'Male', value: 'm'},
    //         {name: 'Female', value: 'f'}
    //       ]
    //     },
    //     name: {name: 'Name', type: 'string'},
    //     notes: {name: 'Notes', type: 'textarea', operators: ['=', '!=']},
    //     educated: {name: 'College Degree?', type: 'boolean'},
    //     birthday: {name: 'Birthday', type: 'date', operators: ['=', '<=', '>'],
    //       defaultValue: (() => new Date())
    //     },
    //     school: {name: 'School', type: 'string', nullable: true},
    //     occupation: {
    //       name: 'Occupation',
    //       type: 'category',
    //       options: [
    //         {name: 'Student', value: 'student'},
    //         {name: 'Teacher', value: 'teacher'},
    //         {name: 'Unemployed', value: 'unemployed'},
    //         {name: 'Scientist', value: 'scientist'}
    //       ]
    //     }
    //   }
    // };

    public config: QueryBuilderConfig = <QueryBuilderConfig>{};
    public query: RuleSet = {condition: "and", rules: []};

    public currentConfig: QueryBuilderConfig;
    public allowRuleset: boolean = true;
    public allowCollapse: boolean;
    public persistValueOnFieldChange: boolean = false;
  
    constructor(
        public service: QueryBuilderDlgService, private formBuilder: FormBuilder, 
        public exprBuilderService: ExpressionBuilderDlgService, private dataService: DataService
    ) 
    {
      console.log("start QueryBuilderDlg constructor");
      this.queryCtrl = this.formBuilder.control(this.query);
      this.currentConfig = this.config;

      this.exprBuilderService.currentConfig.subscribe(
          config => {
            this.adjustConfig(config);
            this.currentConfig = config;
            console.log("currentConfig : " + JSON.stringify(this.currentConfig));
          }
        );
      this.exprBuilderService.currentQuery.subscribe(query => this.query = query);
    }
  
    // switchModes(event: Event) {
    //   this.currentConfig = (<HTMLInputElement>event.target).checked ? this.entityConfig : this.config;
    // }
  
    // changeDisabled(event: Event) {
    //   (<HTMLInputElement>event.target).checked ? this.queryCtrl.disable() : this.queryCtrl.enable();
    // }
  
    async apply() {

      console.log("current query : " + JSON.stringify(this.query));

      // a call to dataservice to get R expression for this.query
      // convert this.query to rExpression
      let rExpression = <string> await this.dataService.json2expression(this.query).toPromise();

      if(rExpression != null) {
        console.log(rExpression.constructor.name);
        console.log("rExpression is not null!");
      }

      console.log("rExpression : '" + rExpression + "'");

      if(this.exprBuilderService.getCurrentTableExpression() != null && rExpression != null) {

        // this.exprBuilderService.getCurrentTableExpression().expression = rExpression;
      }

      this.service.display = false;
    }

    adjustConfig(paramConfig: QueryBuilderConfig) {
      console.log("adjusted config : ");
      for(let key in paramConfig) {
        let value = paramConfig[key];
        console.log("key : " + key + ", value : " + value);
        
        for(let key2 in value) {
          let value2 = value[key2];
          console.log("key2 : " + key2 + ", value2 : " + value2);

          for(let key3 in value2) {
            let value3 = value2[key3];
            console.log("key3 : " + key3 + ", value3 : " + value3);

            if(key3 == 'options') {
              let optionsLength = value3.length;
              console.log("option length : " + optionsLength);

              if(optionsLength > 0) {
                value2["type"] = "category";
                console.log("type changed!");
              } else {
                console.log("option length : " + optionsLength);
              }
            }
          }
        }
      }
    }
}