import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import busImage from "@/assets/images/icon.png";

function formatBangladeshTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  // Convert to Bangladesh time (UTC+6)
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const bdTime = new Date(utc + 6 * 60 * 60000);
  return bdTime.toLocaleString("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export default function AvailableBusListCard({ item, highlightBus }) {
  if (!item) return <Text>Not available</Text>;
  const { trip, latitude, longitude, speed, heading, timestamp } = item;

  return (
    <View className="flex-row items-center px-3 py-2 rounded-xl mb-3 border border-muted-200 bg-white shadow-sm">
      {/* Bus Icon */}
      <View className="mr-3 bg-primary-100 p-2 rounded-full">
        <MaterialCommunityIcons name="bus" size={32} color="#00C89B" />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-bold capitalize text-muted-800 mr-2">{trip.busName}</Text>
          <MaterialIcons name="speed" size={16} color="#6b7280" />
          <Text className="text-xs text-muted-500 ml-1">{(speed * 3.6).toFixed(2)} km/h</Text>
        </View>

        <View className="flex-row">
          <View className="flex-row items-center bg-yellow-200 rounded-full px-2 py-0.5 my-0.5">
            <MaterialCommunityIcons name="bus-clock" size={14} color="black" />
            <Text className="text-xs text-black ml-1">Last update: {formatBangladeshTime(timestamp)}</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="flex-row items-center bg-primary-300 px-2 py-0.5 my-1 rounded-full">
            <MaterialIcons name="person" size={14} color="black" />
            <Text className="text-xs text-black rounded-full capitalize mx-1">{trip.busType} Bus</Text>
          </View>
        </View>
      </View>

      <View className="ml-2">
        <TouchableOpacity
          onPress={() => highlightBus([longitude, latitude])}
          className="bg-secondary-600 px-3 py-1.5 rounded-full flex-row items-center"
        >
          <MaterialIcons name="location-on" size={18} color="white" />
          <Text className="text-white text-sm font-medium ml-1">Track</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
