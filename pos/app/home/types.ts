export type ScanState = "ready" | "processing" | "success";

export type PaymentResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    tripId?: string;
    name?: string;

    checkIn?: boolean;
    checkOut?: boolean;
    checkinTime?: string;
    balance?: number;

    distanceInKm?: number;
    fareDeducted?: number;
    fareStatus?: "deducted" | "failed";
    remainingBalance?: number;
    checkoutTime?: string;

    userName?: string;
  };
};
