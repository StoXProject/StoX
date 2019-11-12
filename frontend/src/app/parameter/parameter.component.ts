import { Component, OnInit, ViewEncapsulation } from '@angular/core';
//import { FormGroup, FormBuilder } from '@angular/forms';
import { ProjectService } from '../service/project.service';
import { PropertyItem } from '../data/propertyitem';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ParameterComponent implements OnInit {
  cols = [
    { field: 'name', header: 'Name', width: '50%' },
    { field: 'value', header: 'Value', width: '50%' }
  ];

  // rowData = [{
  //   category: 'Process',
  //   parameters: [
  //     { name: 'Process name', value: 'ReadBioticXML', type: 'string' },
  //     { name: 'Function', value: 'ReadBioticXML', type: 'string' },
  //     { name: 'Enabled', value: 'false', type: 'boolean' }
  //   ]
  // },
  // {
  //   category: 'GUI',
  //   parameters: [
  //     { name: 'Break in GUI', value: 'true', type: 'boolean' },
  //     { name: 'Respond in GUI', value: 'true', type: 'boolean' }
  //   ]
  // },
  // {
  //   category: 'Parameters',
  //   parameters: [
  //     { name: 'BioticData', value: 'ReadBioticXML', type: 'string' },
  //     { name: 'FishStationExpr', value: "fs.getLengthSampleCount('TORSK')", type: 'string' },
  //     { name: 'CatchExpr', value: "species == '164712'", type: 'string' }
  //   ]
  // }
  // ];


  //  booleanForm: FormGroup;
  constructor(public ps: ProjectService, private dataService: DataService) { }

  async ngOnInit() {
/*    let a = [];
    for (let i = 0; i < 2; i++) {
      let j = { name: null };
      a.push(j);
      j.name = 'test' + i;
    }
    console.log(a[0].name + a[1].name);*/
  }

  getMetParameterValueList(): any[] {
    return [{ name: false }, { name: true }];
  }

  async onChanged(category: PropertyCategory, pi: PropertyItem) {
    console.log("In group " + category.groupName + " parameter " + pi.name + " is changed to " + pi.value);

    // groupName: string, name: string, value: string, projectPath: string, modelName: string, processID: string
    if(this.ps.getSelectedProject() != null && this.ps.getSelectedProcess() != null && this.ps.getSelectedModel() != null) {
        this.ps.propertyCategories = <PropertyCategory[]>JSON.parse( await this.dataService.setProcessPropertyValue(category.groupName, pi.name, pi.value, this.ps.getSelectedProject().projectPath, this.ps.getSelectedModel().modelName, this.ps.getSelectedProcess().processID).toPromise());
        // await this.dataService.setProcessPropertyValue(category.groupName, pi.name, pi.value, this.ps.getSelectedProject().projectPath, this.ps.getSelectedModel().modelName, this.ps.getSelectedProcess().processID).toPromise();
    }
  }

  // filterPossibleValues(event) {
  //   if(this.propertyItem == null) {
  //     return;
  //   }
  //   this.filteredValues = [];
  //   for(let i = 0; i < this.propertyItem.possibleValues.length; i++) {
  //       let currentValue = this.propertyItem.possibleValues[i];
  //       // if(currentValue.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
  //       if(currentValue.toLowerCase().startsWith(event.query.toLowerCase())) {  
  //           this.filteredValues.push(currentValue);
  //       }
  //   }
  // }

  // wrapSelectItems(s: string[]) {
  //   return s.map(st => { return { label: st, value: st }; })
  // }

}
