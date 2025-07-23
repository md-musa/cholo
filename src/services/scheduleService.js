import { apiClient } from "@/config/axiosConfig";

export const getSchedulesByRoute = async (routeId) => {
  try {
    const { data } = await apiClient.get("/schedules/get-single-route-schedule", { routeId });
    console.log("Schedules data", data);
    return data.data;
  } catch (err) {
    console.log(err);
  }
};
