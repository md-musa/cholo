export type PassengerUser = {
  _id: string
  name: string
  phoneNumber: string
  role: "passenger"
  email?: string | null
  avatar?: string | null
}

export type CardInfo = {
  _id: string
  nfcUid: string
  balance: number
  status: string
  lastUsedAt?: string | null
}

export type PassengerProfile = PassengerUser & {
  card: CardInfo | null
}

export type Stoppage = {
  name: string
  coords: [number, number]
}

export type RouteItem = {
  _id: string
  routeNo: string
  routeName: string
  routeLine: [number, number][]
  stopages: Stoppage[]
}

export type BusItem = {
  _id: string
  name: string
}

export type TripItem = {
  _id: string
  routeId?: {
    _id: string
    routeName: string
    routeNo?: string
  } | null
  distanceInKm?: number
  fare?: number
  fareStatus?: "deducted" | "failed"
  status: string
}

export type LiveBus = {
  busId: string
  lat: number
  lng: number
  routeId: string
  plateNumber: string
  routeName: string
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
  }
}
