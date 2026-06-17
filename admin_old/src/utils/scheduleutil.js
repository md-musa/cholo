import { SCHEDULE_DIRECTIONS, SCHEDULE_OPERATING_DAYS, SCHEDULE_USER_TYPES } from "../constants";

export const groupSchedule = (schedules) => {
  return schedules.reduce((groups, schedule) => {
    const routeId = schedule.routeId?._id || "unknown";
    const userType = schedule.userType;
    const operatingDays = schedule.operatingDays;
    const direction = schedule.direction;

    if (!groups[routeId]) {
      groups[routeId] = {
        route: schedule.routeId,
        students: { weekdays: { to: [], from: [] }, friday: { to: [], from: [] } },
        employees: { weekdays: { to: [], from: [] }, friday: { to: [], from: [] } },
      };
    }

    const group = groups[routeId];
    const userGroup = userType === SCHEDULE_USER_TYPES.STUDENT ? group.students : group.employees;
    const dayGroup = operatingDays === SCHEDULE_OPERATING_DAYS.WEEKDAYS ? userGroup.weekdays : userGroup.friday;

    if (direction === SCHEDULE_DIRECTIONS.TO_CAMPUS) {
      dayGroup.to.push(schedule);
    } else {
      dayGroup.from.push(schedule);
    }

    return groups;
  }, {});
};

export const formatTime = (time) => {
  if (!time.includes(":")) {
    if (time.length === 3) {
      return `${time.slice(0, 1)}:${time.slice(1)}`;
    }
    return `${time.slice(0, 2)}:${time.slice(2)}`;
  }
  return time;
};

export const getEnumLabel = (value) => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
