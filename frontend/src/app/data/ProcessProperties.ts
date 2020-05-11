import { PropertyCategory } from './propertycategory';
import { Process } from './process'
import { ProcessTableResult } from './runresult';


export class ProcessProperties extends ProcessTableResult {
    propertySheet?: PropertyCategory[];
    updateHelp?: boolean;
}