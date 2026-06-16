export interface IPaymentData {
  userId: string;
  routeId: string;
  busId: string;
  scheduleId: string;
  nfcUid: string;
  coords: [number, number];
}
