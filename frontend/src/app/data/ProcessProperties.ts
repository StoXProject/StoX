import { PropertyCategory } from './propertycategory';
import { Process } from './process'

export class ProcessProperties {
    propertySheet: PropertyCategory[];
    activeProcessID: string;
    updateHelp?: boolean;
    processTable : Process[];
}