import {ActiveProcess}from './ProcessProperties'
export class RunResult {
    value: any;
    message: string[];
    warning: string[];
    error: string[];
}

export class ProcessResult {
    activeProcess: ActiveProcess;
}

export class RunProcessesResult extends ProcessResult {
    interactiveMode: string;
}

export class PSUResult extends ProcessResult {
    PSU: string;
}