export enum USER_ROLES {
  STUDENT = "student",
  EMPLOYEE = "employee",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum BUS_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

export enum BUS_TYPES {
  STUDENT = "student",
  EMPLOYEE = "employee",
}

export enum TRIP_STATUS {
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELED = "cancelled",
}

export enum SOCKET_EVENTS {
  BROADCAST_BUS_LOCATION = "broadcast-bus-location",
}

export enum ASYNC_STORAGE_KEYS {
  AUTH_TOKEN = "auth_token",
  CURRENT_ROUTE = "current_route",
}
