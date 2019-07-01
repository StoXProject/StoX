import { Component, OnInit, ViewEncapsulation } from '@angular/core';
//import { FormGroup, FormBuilder } from '@angular/forms';

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

  rowData = [{
    category: 'Process',
    parameters: [
      { name: 'Process name', value: 'ReadBioticXML', type: 'string' },
      { name: 'Function', value: 'ReadBioticXML', type: 'string' },
      { name: 'Enabled', value: 'false', type: 'boolean' }
    ]
  },
  {
    category: 'GUI',
    parameters: [
      { name: 'Break in GUI', value: 'true', type: 'boolean' },
      { name: 'Respond in GUI', value: 'true', type: 'boolean' }
    ]
  },
  {
    category: 'Parameters',
    parameters: [
      { name: 'BioticData', value: 'ReadBioticXML', type: 'string' },
      { name: 'FishStationExpr', value: "fs.getLengthSampleCount('TORSK')", type: 'string' },
      { name: 'CatchExpr', value: "species == '164712'", type: 'string' }
    ]
  }
  ];
  //  booleanForm: FormGroup;
  constructor() { }

  ngOnInit() {
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

  onChanged(o: any) {
    console.log("parameter " + o.name + " is changed to " + o.value);
  }


}
