import { Injectable } from '@angular/core';
import { DefinedColumns, ColumnPossibleValues } from '../../data/DefinedColumns';
import { PropertyItem } from '../../data/propertyitem';
import { PropertyCategory } from '../../data/propertycategory';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DefinedColumnsService {
    
    constructor(private ps: ProjectService, private dataService: DataService) {}

    public display: boolean = false;

    public oldNames: string[] = [];

    currentPropertyItem: PropertyItem = null;
    currentPropertyCategory: PropertyCategory = null;

    public definedColumnsData: DefinedColumns [] = [];

    public title: string = "";
    private currentTitleSource = new BehaviorSubject(this.title);
    titleObservable = this.currentTitleSource.asObservable();

    public displayedColumns = ['select'];
    private displayedColumnsSource = new BehaviorSubject(this.displayedColumns);
    displayedColumnsObservable = this.displayedColumnsSource.asObservable();

    columnPossibleValues: ColumnPossibleValues[] = [];
    private columnPossibleValuesSource = new BehaviorSubject(this.columnPossibleValues);
    columnPossibleValuesObservable = this.columnPossibleValuesSource.asObservable();
  
    async showDialog() {
        
        let returnValue  = <any> await this.dataService.getParameterTableInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID, this.currentPropertyItem.format).toPromise();
        
        if(returnValue != null) {
          console.log("returnValue : " + JSON.stringify(returnValue));

          console.log("returnValue['parameterTableTitle'] : " + returnValue['parameterTableTitle']);
          this.title = returnValue['parameterTableTitle'];
          this.currentTitleSource.next(this.title);
          console.log("returnValue['parameterTableColumnNames'] : " + returnValue['parameterTableColumnNames']);
          
          this.displayedColumns = ['select'];
          let columns = returnValue['parameterTableColumnNames'];
          for(let i = 0; i < columns.length; i++) {
            console.log(columns[i]);
            this.displayedColumns.push(columns[i]);
            let column = new ColumnPossibleValues(); 
            column.columnName =  columns[i];
            // column.possibleValues = 
            this.columnPossibleValues.push(column);
          }

          this.displayedColumnsSource.next(this.displayedColumns);

          this.columnPossibleValuesSource.next(this.columnPossibleValues);

          console.log(this.displayedColumns);

          console.log("returnValue['arameterTablePossibleValues'] : " + JSON.stringify(returnValue['arameterTablePossibleValues']));

          let possibleValues = returnValue['arameterTablePossibleValues'];

          for(let j=0; j<possibleValues.length; j++) {
            console.log(possibleValues[j].constructor);

          }
        }


        this.display = true;
    }
}