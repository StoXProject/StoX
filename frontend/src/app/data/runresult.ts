export class RunResult {
    value: any;
    message: string[];
    warning: string[];
    error: string[];
}

export class ProcessResult {
    activeProcessID: string;
}
export class RunProcessesResult extends ProcessResult {
    interactiveMode: string
}