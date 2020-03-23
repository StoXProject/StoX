import { ActiveProcess } from './ProcessProperties'
import { Process } from './process'
export class RunResult {
    value: any;
    message: string[];
    warning: string[];
    error: string[];
}

export class ProcessResult {
    processTable?: Process[];
    activeProcess?: ActiveProcess;
    saved?: boolean;
}

export class RunProcessesResult extends ProcessResult {
    interactiveMode: string;
}

export class PSUResult extends ProcessResult {
    PSU: string;
}