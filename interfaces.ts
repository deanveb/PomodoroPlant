export interface setting {
  shortBreakDuration: number;
  longBreakDuration: number;
  workDuration: number;
  session: number;
}

export interface tree {
  image: string;
}

export interface owned {
  cash: number;
  trees: Record<string, tree>;
}

export interface TreeLayoutInfo {
  layout: Record<string, string>;
}

export interface bootSave {
  status: string;
  breakStatus: string;
  time: number;
  start: number;
}
