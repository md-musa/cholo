import React, { useState } from "react";
import { View, Text, Image, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import busImage from "@/assets/images/icon.png";
import { findOngoingOrNextSchedule } from "@/utils/scheduleHelper";
import { Link } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { updateRoute } from "@/store/features/auth/authSlice";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useGetScheduleByRouteQuery } from "@/store/features/schedule/scheduleApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_STORAGE_KEYS } from "@/constants";

// Import icons
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const RouteSelector = () => {
  const dispatch = useAppDispatch();
  const { route } = useAppSelector((state) => state.auth);
  const { isBroadcasting } = useAppSelector((state) => state.broadcast);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase() === "friday" ? "Friday" : "Weekdays"
  );

  const { data: routes, isLoading: isRoutesLoading } = useGetRoutesQuery();
  const { data: scheduleResult } = useGetScheduleByRouteQuery({ routeId: route?._id, day: selectedDay });

  if (!route) return null;
  const handleRouteChange = async (selectedRouteId) => {
    const selectedRouteData = routes.find((r) => r._id === selectedRouteId);
    dispatch(updateRoute(selectedRouteData));
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(selectedRouteData));
  };

  const toCampusStudent = findOngoingOrNextSchedule(scheduleResult?.schedules?.to_campus?.student || []);
  const fromCampusStudent = findOngoingOrNextSchedule(scheduleResult?.schedules?.from_campus?.student || []);
  const toCampusEmployee = findOngoingOrNextSchedule(scheduleResult?.schedules?.to_campus?.employee || []);
  const fromCampusEmployee = findOngoingOrNextSchedule(scheduleResult?.schedules?.from_campus?.employee || []);
  return (
    <View className="bg-primary-500 p-4 rounded-xl">
      <View className="flex flex-row items-center bg-white border border-muted-300 rounded-xl px-3">
        {/* <Image source={busImage} className="rounded-md" resizeMode="contain" style={{ width: 30, height: 30 }} /> */}

        {/* <MaterialIcons name="route" size={24} color="#24204DE6" className="bg-muted-200 p-1 rounded-lg"/> */}
        <MaterialCommunityIcons name="routes" size={24} color="#24204DE6" className="bg-muted-200 p-1 rounded-md" />
        <Picker
          selectedValue={route._id}
          onValueChange={handleRouteChange}
          enabled={!isBroadcasting}
          value
          style={{
            flex: 1,
            backgroundColor: "white",
            fontSize: 16,
            fontWeight: "bold",
            color: "black",
          }}
          dropdownIconColor="black"
          mode="dropdown"
        >
          {/* <Picker.Item
            label="Select a route"
            value=""
            style={{
              fontWeight: "bold",
              fontSize: 16,
            }}
          /> */}
          {isRoutesLoading && route ? (
            <Picker.Item
              key={route?._id}
              label={`${route.routeName}`}
              value={route._id}
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: "black",
              }}
            />
          ) : (
            routes?.map((route) => (
              <Picker.Item
                key={route?._id}
                label={`${route.routeName}`}
                value={route._id}
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "black",
                }}
              />
            ))
          )}
        </Picker>
      </View>

      <View className="flex-row my-2">
        <View className="flex-row items-center bg-muted-50/25 py-1 px-2 rounded-xl">
          <MaterialIcons name="schedule" size={16} color="#ffff" />
          <Text className="text-md text-white mx-2 font-semibold">Next Bus Schedule</Text>
        </View>
      </View>

      {/* 3x3 Grid */}
      <View className="border-b border-white rounded-t-xl overflow-hidden">
        {/* Grid Container */}
        <View className="flex-col">
          {/* Header Row */}
          <View className="flex-row bg-muted-50/15 border-b border-white">
            <View className="flex-1 p-2 items-center justify-center">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="swap-vertical-variant" size={20} color="#fff" />
                <Text className="text-white text-md font-semibold ml-2">Route</Text>
              </View>
            </View>

            <View className="flex-1 p-2 items-center justify-center border-l border-r border-white">
              <View className="flex-row items-center">
                <FontAwesome5 name="user-graduate" size={15} color="#fff" />
                <Text className="text-white text-md font-semibold ml-2">Student</Text>
              </View>
            </View>

            <View className="flex-1 p-2 items-center justify-center">
              <View className="flex-row items-center justify-end">
                <FontAwesome5 name="user-tie" size={15} color="#fff" />
                <Text className="text-white text-md font-semibold ml-2">Employee</Text>
              </View>
            </View>
          </View>

          {/* To Campus Row */}
          <View className="flex-row border-b border-white">
            <View className="flex-1 p-2 justify-center">
              <Text className="text-white text-md">{`To Campus`}</Text>
            </View>
            <View className="flex-1 p-2 items-center justify-center border-l border-r border-white">
              <Text className="text-white text-md text-center">
                {toCampusStudent ? toCampusStudent.formattedTime : "No schedule"}
              </Text>
            </View>
            <View className="flex-1 p-2 items-center justify-center">
              <Text className="text-white text-md text-right">
                {toCampusEmployee ? toCampusEmployee.formattedTime : "No schedule"}
              </Text>
            </View>
          </View>

          {/* From Campus Row */}
          <View className="flex-row">
            <View className="flex-1 p-2 justify-center">
              <Text className="text-white text-md">{`From Campus`}</Text>
            </View>
            <View className="flex-1 p-2 items-center justify-center border-l border-r border-white">
              <Text className="text-white text-md text-center">
                {fromCampusStudent ? fromCampusStudent.formattedTime : "No schedule"}
              </Text>
            </View>
            <View className="flex-1 p-2 items-center justify-center">
              <Text className="text-white text-md text-right">
                {fromCampusEmployee ? fromCampusEmployee.formattedTime : "No schedule"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Link className="text-right text-white mt-2 text-md font-semibold" href="/home/schedules">
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
          <Text className="text-white">View all </Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color="#fff" />
        </View>
      </Link>
    </View>
  );
};

export default RouteSelector;
