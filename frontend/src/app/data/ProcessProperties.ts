import { PropertyCategory } from './propertycategory';
import { Process } from './process'
import { ProcessTableResult } from './runresult';

export class ActiveProcess {
    processID?: string;
    modified?: boolean;
}
export class ProcessProperties extends ProcessTableResult {
    propertySheet?: PropertyCategory[];
    updateHelp?: boolean;
}