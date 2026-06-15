import { SCHEDULE_STATUS } from "@/constants";
import moment from "moment";

export function findOngoingOrNextSchedule(schedules) {
  if (!schedules || schedules.length === 0) return null;

  const now = moment();
  let ongoingSchedule = null;
  let nextSchedule = null;
  let nextScheduleTimeDiff = Infinity; // Store min difference for next schedule

  schedules.forEach((schedule) => {
    const scheduleTime = moment(schedule.time, "HH:mm"); // Parse schedule time
    const scheduleEndTime = scheduleTime.clone().add(15, "minutes"); // Add 30 minutes

    // Check if the current time is within schedule time to +15 minutes range
    if (now.isBetween(scheduleTime, scheduleEndTime)) {
      ongoingSchedule = { ...schedule, status: SCHEDULE_STATUS.NEXT };
    }
    // Find the next upcoming schedule (smallest future time)
    else if (scheduleTime.isAfter(now)) {
      const timeDiff = scheduleTime.diff(now, "minutes");
      if (timeDiff < nextScheduleTimeDiff) {
        nextScheduleTimeDiff = timeDiff;
        nextSchedule = { ...schedule, status: SCHEDULE_STATUS.NEXT };
      }
    }
  });

  // Format the schedule time to 12-hour format
  const formatScheduleTime = (schedule) =>
    schedule ? { ...schedule, formattedTime: moment(schedule.time, "HH:mm").format("hh:mm A") } : null;

  return formatScheduleTime(ongoingSchedule) || formatScheduleTime(nextSchedule);
}

export function processSchedules(schedules) {
  if (!schedules || schedules.length == 0) return [];
  const now = moment();

  // Helper function to determine the status
  const getStatus = (scheduleTime) => {
    const scheduleMoment = moment(scheduleTime, "HH:mm");
    return now.isBetween(scheduleMoment, scheduleMoment.clone().add(15, "minutes")) ? SCHEDULE_STATUS.ACTIVE : null;
  };

  // Sort schedules by time
  schedules.sort((a, b) => (moment(a.time, "HH:mm").isBefore(moment(b.time, "HH:mm")) ? -1 : 1));

  // Process schedules
  return schedules.map((schedule, index, array) => {
    const status = getStatus(schedule.time);
    const formattedTime = moment(schedule.time, "HH:mm").format("hh:mm A");

    // Assign SCHEDULE_STATUS.NEXT status only to the first future schedule
    if (!status && index === array.findIndex((s) => moment(s.time, "HH:mm").isAfter(now))) {
      return { ...schedule, formattedTime, status: SCHEDULE_STATUS.NEXT };
    }

    return { ...schedule, formattedTime, status: status || null };
  });
}
