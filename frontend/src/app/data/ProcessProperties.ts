import { PropertyCategory } from './propertycategory';
import { Process } from './process'

export class ActiveProcess {
    processID? : string;
    modified? : boolean;
}
export class ProcessProperties {
    propertySheet: PropertyCategory[];
    activeProcessID: ActiveProcess;
    updateHelp?: boolean;
    processTable : Process[];
}