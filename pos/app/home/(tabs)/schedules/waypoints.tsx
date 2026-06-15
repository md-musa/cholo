import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useAppSelector } from "@/store/storeConfig";
import { getWaypoints } from "@/assets/routes";
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from "@expo/vector-icons";

const Waypoints = () => {
  const { route } = useAppSelector((state) => state.auth);

  if (!route) {
    return <Text className="text-center mt-4 text-muted-600">No route selected</Text>;
  }

  const waypoints = getWaypoints(route.routeNo) || [];

  if (waypoints.length === 0) {
    return <Text className="text-center mt-4 text-muted-600">No waypoints available for this route</Text>;
  }

  const getDensityColor = (density: string) => {
    switch (density?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-muted-100 text-muted-800";
    }
  };

  return (
    <View className="flex-1 bg-muted-50 p-4">
      {/* Header */}
      <View className="bg-primary-400 rounded-xl p-4 mb-4">
        <Text className="text-xl font-bold text-muted-800 text-center mb-1">{route.routeName} to Campus</Text>
        {/* <Text className="text-muted-500 text-center">
          <MaterialIcons name="directions-bus" size={16} color="#6b7280" /> {route.name} Route
        </Text> */}
      </View>

      {/* Waypoints Timeline */}
      <FlatList
        data={waypoints}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View className="flex-row mb-4">
            {/* Timeline Line */}
            <View className="items-center w-10">
              {/* Top Node */}
              {index === 0 ? (
                <View className="w-6 h-6 bg-secondary-600 rounded-full items-center justify-center">
                  <FontAwesome5 name="flag" size={12} color="white" />
                </View>
              ) : (
                <View className="w-4 h-4 bg-secondary-400 rounded-full mt-1.5" />
              )}

              {/* Line */}
              {index !== waypoints.length - 1 && <View className="w-0.5 flex-1 bg-secondary-200 mt-1" />}

              {/* Last Node (School) */}
              {index === waypoints.length - 1 && (
                <View className="w-6 h-6 bg-secondary-600 rounded-full items-center justify-center mt-1">
                  <Ionicons name="school" size={14} color="white" />
                </View>
              )}
            </View>

            {/* Waypoint Card */}
            <View className="flex-1 bg-white border border-muted-300 rounded-lg shadow-sm p-3 ml-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-semibold text-muted-800">{item.location}</Text>

                  <View className="flex-row items-center justify-start py-1">
                    {item.estimatedTime && (
                      <View className="flex-row items-center bg-primary-200 rounded-full px-2">
                        <MaterialIcons name="access-time" size={14} color="#6b7280" />
                        <Text className="text-sm text-black ml-1 font-medium">{item.estimatedTime} minutes</Text>
                      </View>
                    )}

                    {item.studentDensity && (
                      <View
                        className={`mx-2 px-2 py-1 rounded-full self-start ${getDensityColor(item.studentDensity)}`}
                      >
                        <View className="flex-row items-center">
                          <MaterialIcons name="people" size={12} color="#6b7280" />
                          <Text className="text-xs font-medium capitalize ml-1">{item.studentDensity} density</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Location Pin */}
                <TouchableOpacity className="p-1" onPress={() => console.log("Navigate to", item.location)}>
                  <Entypo name="location-pin" size={26} color="#818cf8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default Waypoints;
