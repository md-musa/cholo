import apiClient from "@/config/axiosInstance";

type AssignmentRoute = {
  _id: string;
  routeNo?: string;
  routeName: string;
};

type AssignmentBus = {
  _id: string;
  name: string;
};

type AssignmentResponse = {
  route: AssignmentRoute | null;
  bus: AssignmentBus | null;
};

const normalizeAssignment = (payload: any): AssignmentResponse => {
  const data = payload?.data || payload;

  return {
    route: data?.assignedRoute || data?.route || null,
    bus: data?.assignedBus || null,
  };
};

export const fetchPosAssignment = async (userId: string): Promise<AssignmentResponse> => {
  try {
    const passengerResponse = await apiClient.get(`/users/passenger/${userId}`);
    const normalizedPassenger = normalizeAssignment(passengerResponse);

    if (normalizedPassenger.route && normalizedPassenger.bus) {
      return normalizedPassenger;
    }
  } catch (error) {
    //console.log("Passenger assignment lookup failed:", JSON.stringify(error, null, 2));
  }

  const posDeviceResponse = await apiClient.get(`/users/pos-device/${userId}`);
  return normalizeAssignment(posDeviceResponse);
};
