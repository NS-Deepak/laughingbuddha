export interface PriceAlert {
  id: string;
  assetSymbol: string;
  assetName: string | null;
  assetType: string;
  triggerType: string;
  triggerValue: string;
  isActive: boolean;
}

export interface ScheduleAsset {
  asset: {
    symbol: string;
    name: string;
  };
}

export interface Schedule {
  id: string;
  name: string;
  targetTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  assets: ScheduleAsset[];
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
}

export interface ScheduleFormState {
  name: string;
  targetTime: string;
  daysOfWeek: number[];
  assetIds: string[];
}

export interface AlertFormState {
  assetId: string;
  assetSymbol: string;
  assetName: string;
  triggerValue: string;
}

export type ActiveTab = "alerts" | "digests";
export type DeleteTarget = { type: "alert" | "schedule"; id: string } | null;
export type ToastState = { message: string; type: "success" | "error" } | null;
