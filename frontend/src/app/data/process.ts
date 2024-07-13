export class Process {
  processID: string;
  processName: string;
  modelName: string;
  functionName?: string; // not used in gui.
  enabled?: boolean; // show greyed
  showInMap?: boolean; // if to be shown in map
  fileOutput?: boolean; // not used in gui
  functionInputs?: string[]; // not used in gui
  functionParameters?: any; // not used in gui
  functionOutputDataType: string;
  functionInputError?: boolean; // model status flag.
  canShowInMap?: boolean; // have overlay globe icon
  hasProcessData?: boolean; // process with color in middle.
  hasBeenRun?: boolean; // not used in gui.
  //modified?: boolean; // not needed - remove this, replaced by processDirty at ActiveProcess
  functionInputProcessIDs?: string[];
  usedInProcessIDs?: string[];
  terminalProcess?: boolean; // not used as input in the model.
}
