export type ScanState = "idle" | "scanning" | "processing" | "success" | "error";

export type PaymentResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    tripId?: string;
    
    // Check-in fields
    startStoppage?: string;
    checkinTime?: string;
    balance?: number;

    // Check-out fields
    endStoppage?: string;
    distanceInKm?: number;
    fareDeducted?: number;
    fareStatus?: "deducted" | "failed";
    remainingBalance?: number;
    checkoutTime?: string;

    // Optional legacy compatibility
    userName?: string;
  };
};
