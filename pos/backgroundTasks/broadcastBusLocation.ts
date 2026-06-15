import BackgroundService from "react-native-background-actions";
import * as Location from "expo-location";
import socket from "@/config/socketIoConfig";
import { SOCKET_EVENTS } from "@/constants";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

type LocationTaskData = {
  tripId: string;
};

const startBackgroundLocationTask = async (taskData: LocationTaskData) => {
  try {
    const options = {
      taskName: "location_sharing",
      taskTitle: "You're Sharing Location",
      taskDesc: "Sharing live location with with students and employees",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#0066cc",
      linkingURI: "cholo://home/broadcast",
      parameters: taskData,
    };

    await BackgroundService.start(async (taskData?: LocationTaskData) => {
      if (!taskData) {
        throw new Error("No task data provided");
      }
      const { tripId } = taskData;

      // Request permissions if needed
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Background location permission denied");
      }

      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          if (!socket.connected) {
            socket.connect();
          }
          //  console.log("[BACKGROUND BROADCAST]: ", location);
          socket.emit(SOCKET_EVENTS.BROADCAST_BUS_LOCATION, {
            tripId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          });
          updateBackgroundNotification(location);
        }
      );

      // Keep the task running
      while (BackgroundService.isRunning()) {
        //  console.log("[Inside background loop]");
        await sleep(5000);
      }

      watcher.remove();
    }, options);
  } catch (error) {
    // console.log("[Background Task Error]: ", error);
    console.error("Failed to start background task:", JSON.stringify(error, null, 2));
    throw error;
  }
};

const stopBackgroundLocationTask = async () => {
  if (await BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

const isBackgroundTaskRunning = async () => {
  return BackgroundService.isRunning();
};

const updateBackgroundNotification = async (location: Location.LocationObject) => {
  if (!location.coords.speed) return;
  try {
    await BackgroundService.updateNotification({
      taskDesc: `Current Speed: ${(location.coords.speed * 3.6).toFixed(2)} km/h\n To stop, click here`,
    });
  } catch (err) {
    //console.log("Background Notification: ", err);
  }
};

export const BroadcastBusLocationInBackground = {
  start: startBackgroundLocationTask,
  stop: stopBackgroundLocationTask,
  isRunning: isBackgroundTaskRunning,
};
