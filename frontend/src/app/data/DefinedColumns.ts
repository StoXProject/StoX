export class DefinedColumns {
    SpeciesCategory: string; 
    NewSpeciesCategory: string;
    NewAcousticCategory: string;
    Alpha: number;
    Beta : number;
    LMin: number; 
    LMax: number; 
    AcousticCategory: string;
    m: number;
    a: number;
    d: number; 
}

export class ColumnPossibleValues {
    columnName: string;
    possibleValues: string[];
}

export class ColumnType {
    columnName: string;
    type: string;    
}