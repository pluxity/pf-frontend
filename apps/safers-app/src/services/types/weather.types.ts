// ==================== 초단기실황 ====================
export type UltraSrtNcstCategory = "T1H" | "RN1" | "UUU" | "VVV" | "REH" | "PTY" | "VEC" | "WSD";

export interface UltraSrtNcstItem {
  baseDate: string;
  baseTime: string;
  category: UltraSrtNcstCategory;
  nx: number;
  ny: number;
  obsrValue: string;
}

export type UltraSrtNcstResponse = UltraSrtNcstItem[];

// ==================== 초단기예보 ====================
export type UltraSrtFcstCategory =
  | "T1H"
  | "RN1"
  | "SKY"
  | "UUU"
  | "VVV"
  | "REH"
  | "PTY"
  | "LGT"
  | "VEC"
  | "WSD";

export interface UltraSrtFcstItem {
  baseDate: string;
  baseTime: string;
  category: UltraSrtFcstCategory;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export type UltraSrtFcstResponse = UltraSrtFcstItem[];
