import { ActiveProcess } from './ProcessProperties'
import { Process } from './process'
export class RunResult {
    value: any;
    message: string[];
    warning: string[];
    error: string[];
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