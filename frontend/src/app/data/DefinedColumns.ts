export class DefinedColumns {
    SpeciesCategory: string; 
    // NewSpeciesCategory: string;
    // NewAcousticCategory: string;
    Alpha: number;
    Beta : number;
    LMin: number; 
    LMax: number; 
    // AcousticCategory: string;
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
    NewValue: string;   
}

export class ColumnPossibleValues {
    columnName: string;
    possibleValues: string[];
}

export class ColumnType {
    columnName: string;
    type: string;    
}