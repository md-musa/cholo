import { SCHEDULE_DIRECTIONS, SCHEDULE_USER_TYPES } from "../../../constants";
import { ISchedule } from "./schedule.interface";
import ScheduleModel from "./schedule.model";
import ApiError from "../../../errors/ApiError";

const createSchedule = async (data: ISchedule) => {
  const schedule = await ScheduleModel.create(data);
  return schedule;
};

const getAllSchedules = async (query) => {
  if (query?.routeId) {
    return await ScheduleModel.find({ routeId: query.routeId })
      .populate("routeId", "routeNo routeName")
      .populate("assignedBuses", "name");
  }
  return await ScheduleModel.find().populate("routeId", "routeNo routeName").populate("assignedBuses", "name");
};

const getSchedulesByRoute = async (routeId: string, scheduleMode: string, day: string) => {
  const schedules = await ScheduleModel.find({
    routeId,
    mode: scheduleMode,
    operatingDays: day,
  })
    .populate("routeId", "name startLocation endLocation")
    .populate("assignedBuses", "name");

  const groupedSchedules = {
    from_campus: {
      student: [] as ISchedule[],
      employee: [] as ISchedule[],
    },
    to_campus: {
      student: [] as ISchedule[],
      employee: [] as ISchedule[],
    },
  };

  for (const schedule of schedules) {
    const directionKey =
      schedule.direction === SCHEDULE_DIRECTIONS.FROM_CAMPUS
        ? SCHEDULE_DIRECTIONS.FROM_CAMPUS
        : SCHEDULE_DIRECTIONS.TO_CAMPUS;
    const userTypeKey =
      schedule.userType === SCHEDULE_USER_TYPES.STUDENT ? SCHEDULE_USER_TYPES.STUDENT : SCHEDULE_USER_TYPES.EMPLOYEE;

    groupedSchedules[directionKey][userTypeKey].push(schedule);
  }

  const sortByTime = (a: ISchedule, b: ISchedule) => a.time.localeCompare(b.time);

  Object.values(groupedSchedules).forEach((group) => {
    group.student.sort(sortByTime);
    group.employee.sort(sortByTime);
  });

  return groupedSchedules;
};

const updateSchedule = async (id: string, data: ISchedule) => {
  const updated = await ScheduleModel.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!updated) {
    throw ApiError.notFound("Schedule not found");
  }

  return updated;
};

const deleteSchedule = async (id: string) => {
  const deleted = await ScheduleModel.findByIdAndDelete(id);

  if (!deleted) {
    throw ApiError.notFound("Schedule not found");
  }

  return deleted;
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getSchedulesByRoute,
  updateSchedule,
  deleteSchedule,
};
