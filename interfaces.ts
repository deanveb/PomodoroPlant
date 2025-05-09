export interface setting {
  shortBreakDuration : number;
  longBreakDuration : number;
  workDuration : number;
  session : number
}

export interface TreeLayoutInfo {
  layout: Record<string, string>;
}

export interface bootSave {
  status : string,
  breakStatus : string,
  time : number,
  start : number,
}