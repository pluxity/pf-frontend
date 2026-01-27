export interface WorkType {
  id: number;
  name: string;
}

export interface ProcessStatus {
  id: number;
  workDate: string;
  workType: WorkType;
  plannedRate: number;
  actualRate: number;
}
