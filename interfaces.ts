export interface setting {
  shortBreakDuration : number;
  longBreakDuration : number;
  workDuration : number;
  session : number
}

export interface TreeLayoutInfo {
  layout: Record<string, string>;
}