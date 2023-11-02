import { PropertyCategory } from './propertycategory';
import { Process } from './process';
import { ProcessTableResult } from './runresult';

export class ProcessProperties extends ProcessTableResult {
  propertySheet?: PropertyCategory[];
  updateHelp?: boolean;
}

export class ProcessTableBaseOutput {
  numberOfLines: number;
  numberOfPages: number;
}

export class ProcessTableOutput extends ProcessTableBaseOutput {
  data: string[];
}

export class ProcessGeoJsonOutput extends ProcessTableBaseOutput {
  data: string; // Missing array?
}
