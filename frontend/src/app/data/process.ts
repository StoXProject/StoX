export class Process {
  processID: string;
  processName: string;
  modelName: string;
  functionName?: string; // not used in gui.
  canShowInMap?: boolean; // have overlay globe icon
  enabled?: boolean; // show greyed
  showInMap?: boolean; // if to be shown in map
  fileOutput?: boolean; // not used in gui
  hasProcessData?: boolean; // process with color in middle.
  hasModelError?: boolean; // model status flag.
  dataType?: string; // not used in gui.
  functionInputs?: string[]; // not used in gui
  functionParameters?: string[]; // not used in gui
}