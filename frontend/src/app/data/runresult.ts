
import { Process } from './process'

export class RunResult {
    value: any;
    message: string[];
    warning: string[];
    error: string[];
}

export class ActiveProcess {
    processID?: string;
    processDirty?: boolean; // process has been changed by user and not run. either process data or parameters
    propertyDirty?: boolean; // the properties of the process has been changed by a run, ie userprocessdata set to true.
  }
  
export class SavedResult {
    saved?: boolean;
}

export class ActiveProcessResult extends SavedResult {
    activeProcess?: ActiveProcess;
}

export class ProcessTableResult extends ActiveProcessResult{
    processTable?: Process[];
}

export class RunProcessesResult extends ProcessTableResult {
    interactiveMode: string;
}

export class PSUResult extends ProcessTableResult {
    PSU: string;
}

export class ProcessOutputElement {
    elementName?: string;
    elementFullName?: string;
    elementType?: string;
}
