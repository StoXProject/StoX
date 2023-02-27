export class DefinedColumns {
    /*
    SpeciesCategory: string; 
    Alpha: number;
    Beta : number;
    LMin: number; 
    LMax: number; 
    m: number;
    a: number;
    d: number; 
    MinimumNumberOfStations: number;
    DistanceNauticalMiles: number;
    TimeHours: number;
    BottomDepthMeters: number;
    LatitudeDecimalDegrees: number;
    LongitudeDecimalDegrees: number;
    AcousticCategory: number;
    Frequency: number;
    TableName: string;
    VariableName: string;
    Value: string;
    NewValue: string;   */

    columnValues: ColumnValue[] = [];
    columnTypes: any;

    getValue(columnName: string): any {
        for(let i = 0; i< this.columnValues.length; i++) {
            if(this.columnValues[i].columnName == columnName) {
                return this.columnValues[i].value;
            }
        }
        return null;
    }

    getColumn(columnName: string): ColumnValue {
        for(let i = 0; i< this.columnValues.length; i++) {
            if(this.columnValues[i].columnName == columnName) {
                return this.columnValues[i]
            }
        }
        return null;        
    }
}

export class ColumnPossibleValues {
    columnName: string;
    possibleValues: string[];
}

export class ColumnType {
    columnName: string;
    type: string;    
}

export class ColumnValue {
    columnName: string;
    value: any;
}

export class SelectedVariable {
    variableName: string;
}