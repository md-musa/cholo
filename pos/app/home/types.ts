export type ScanState = "idle" | "scanning" | "processing" | "success" | "error";

export type PaymentResponse = {
  message?: string;
  data?: {
    startStopage?: string;
    endStopage?: string;
    fare?: number;
    distanceInKm?: number;
    userName?: string;
    balance?: number;
  };
};
