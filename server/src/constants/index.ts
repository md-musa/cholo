export enum USER_ROLES {
  PASSENGER = "passenger",
  POS_DEVICE = "pos_device",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum BUS_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

export enum TRIP_STATUS {
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELED = "cancelled",
}

export enum BUS_TYPES {
  AC = "AC",
  NON_AC = "NON_AC",
}

export enum SOCKET_EVENTS {
  JOIN_ROUTE = "join-route",
  BROADCAST_BUS_LOCATION = "broadcast-bus-location",
  VIEW_LOCATIONS = "view-locations",
  REQUEST_BUS_LOCATION = "request-bus-location",
  BUS_LOCATION_UPDATE = "bus-location-update",
}


