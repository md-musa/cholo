import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { processSchedules } from "@/utils/scheduleHelper";
import ScheduleCard from "@/components/ScheduleCard";
import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useGetScheduleByRouteQuery } from "@/store/features/schedule/scheduleApi";
import { updateRoute } from "@/store/features/auth/authSlice";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import LoadingScreen from "@/components/UI/LoadingScreen";
import { colors } from "@/config/colors";

const BusSchedule = () => {
  const scheduleTypes = ["regular", "mid-term", "final", "ramadan"];
  const scheduleDays = ["weekdays", "friday"];

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, route } = useAppSelector((state) => state.auth);
  const { isBroadcasting } = useAppSelector((state) => state.broadcast);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(user?.role);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase() === "friday" ? "friday" : "weekdays"
  );

  const { data: routes } = useGetRoutesQuery();
  const { data: scheduleResult, isLoading: isScheduleLoading } = useGetScheduleByRouteQuery({
    routeId: route?._id,
    day: selectedDay,
  });

  // console.log(JSON.stringify(scheduleResult, null, 2));
  useEffect(() => {
    if (scheduleResult) setSelectedType(scheduleResult.scheduleMode);
  }, [scheduleResult]);

  const handleRouteChange = async (selectedRouteId) => {
    const selectedRouteData = routes.find((r) => r._id === selectedRouteId);
    dispatch(updateRoute(selectedRouteData));
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(selectedRouteData));
  };
  if (isScheduleLoading) return <LoadingScreen />;

  const toCampusStudent = processSchedules(scheduleResult?.schedules?.to_campus?.student || []);
  const fromCampusStudent = processSchedules(scheduleResult?.schedules?.from_campus?.student || []);
  const toCampusEmployee = processSchedules(scheduleResult?.schedules?.to_campus?.employee || []);
  const fromCampusEmployee = processSchedules(scheduleResult?.schedules?.from_campus?.employee || []);

  const NoSchedule = ({ message }) => (
    <View className="flex-col items-center justify-center my-6 py-4 px-4 bg-muted-100 rounded-xl border border-muted-200 shadow-sm">
      <MaterialCommunityIcons name="bus-clock" size={40} color={colors.tertiary[400]} />
      <Text className="text-muted-700 font-semibold text-base mt-3 mb-1">No Schedule Available</Text>
      <Text className="text-muted-500 text-center">
        {message || "There are currently no bus schedules for this selection."}
      </Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-muted-50 px-4">
      <View className="">
        <View className="mt-4 my-2">
          <View className="flex-row flex-wrap mb-3">
            {scheduleTypes.map((type) => (
              <TouchableOpacity
                key={type}
                className={`mx-1 px-4 py-1 border rounded-full ${
                  selectedType === type ? "bg-secondary-500" : "bg-muted-100"
                } border-muted-300`}
                disabled={true} // Disabled as requested
              >
                <Text className={`capitalize ${selectedType === type ? "text-white" : "text-muted-500"}`}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* ---- Schedule days -----  */}
          <View className="flex-row flex-wrap">
            {scheduleDays.map((day) => (
              <TouchableOpacity
                key={day}
                className={`mx-1 px-4 py-1 border rounded-full ${
                  selectedDay === day ? "bg-secondary-500" : "bg-white"
                } border-muted-300`}
                onPress={() => setSelectedDay(day)}
              >
                <Text className={`capitalize ${selectedDay === day ? "text-white" : "text-black"}`}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/home/schedules/waypoints")}
        className="py-2 mt-2 mb-1 bg-white border border-muted-300 rounded-full flex-row items-center justify-center"
      >
        <MaterialCommunityIcons name="map-marker-path" size={18} color="black" style={{ marginRight: 8 }} />
        <Text className="text-center text-black text-mg">View Stoppages</Text>
      </TouchableOpacity>

      <View className="bg-tertiary-900 rounded-t-3xl rounded-b-xl my-4 p-1">
        <View className="mt-4 flex-row justify-between items-center px-4">
          <View className="flex-row items-center flex-[0.6]">
            <Feather name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-lg font-semibold text-white">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          <View className="flex-row items-center flex-[0.4] rounded-lg overflow-hidden">
            <Picker
              selectedValue={route?._id}
              onValueChange={handleRouteChange}
              enabled={!isBroadcasting}
              style={{
                flex: 1,
                backgroundColor: "white",
                fontSize: 14,
                color: "black",
              }}
              dropdownIconColor="black"
              mode="dialog"
            >
              <Picker.Item
                label="Select a route"
                value=""
                style={{
                  fontSize: 14,
                }}
              />
              {routes?.map((route) => (
                <Picker.Item
                  key={route?._id}
                  label={`${route?.routeName}`}
                  value={route?._id}
                  style={{
                    fontSize: 14,
                  }}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View className="bg-white p-4 my-4 rounded-xl">
          <View className="flex-row justify-around rounded-md">
            {/* Student Button  */}
            <TouchableOpacity
              className={`px-6 py-2 rounded-lg border w-[45%] mx-2
              ${selectedFilter === "student" ? "bg-secondary-500 border-secondary-600" : "bg-white border-muted-400"}`}
              onPress={() => setSelectedFilter("student")}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome5
                  name="user-graduate"
                  size={14}
                  color={selectedFilter === "student" ? "white" : colors.secondary[500]}
                />

                <Text
                  className={`text-center font-semibold mx-1 
                ${selectedFilter === "student" ? "text-white" : "text-muted-700"}`}
                >
                  Student
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-2 rounded-lg border w-[45%] mx-2
              ${selectedFilter === "employee" ? "bg-secondary-500 border-secondary-600" : "bg-white border-muted-400"}`}
              onPress={() => setSelectedFilter("employee")}
            >
              <View className="flex-row items-center justify-center">
                <MaterialCommunityIcons
                  name="account-tie"
                  size={18}
                  color={selectedFilter === "employee" ? "white" : colors.secondary[500]}
                />
                <Text
                  className={`text-center font-semibold mx-1
                ${selectedFilter === "employee" ? "text-white" : "text-muted-700"}`}
                >
                  Employee
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            {selectedFilter == "student" ? (
              <>
                <View className="">
                  <View className="flex-row items-center justify-center bg-white px-4 py-1 rounded-2xl my-2  border-muted-300">
                    <Text className="text-muted-600 font-semibold text-lg">{route?.routeName}</Text>
                    <Feather name="arrow-right-circle" size={20} color={colors.secondary[500]} className="mx-2" />
                    <Text className="text-muted-600 font-semibold text-lg">Campus</Text>
                  </View>

                  {toCampusStudent?.length > 0 ? (
                    toCampusStudent?.map((schedule) => <ScheduleCard key={schedule?._id} schedule={schedule} />)
                  ) : (
                    <NoSchedule message="No bus schedule found for students going to campus." />
                  )}
                </View>
                <View className="">
                  <View className="flex-row items-center justify-center bg-white px-4 py-1 rounded-2xl my-2 mt-5  border-muted-300">
                    <Text className="text-muted-600 font-semibold text-lg">Campus</Text>
                    <Feather name="arrow-right-circle" size={20} color={colors.secondary[500]} className="mx-2" />
                    <Text className="text-muted-600 font-semibold text-lg">{route?.routeName}</Text>
                  </View>

                  {fromCampusStudent?.length > 0 ? (
                    fromCampusStudent?.map((schedule) => <ScheduleCard key={schedule?._id} schedule={schedule} />)
                  ) : (
                    <NoSchedule message="No bus schedule found for students leaving campus." />
                  )}
                </View>
              </>
            ) : (
              <>
                <View className="">
                  <View className="flex-row items-center justify-center bg-white px-4 py-1 rounded-2xl my-2  border-muted-300">
                    <Text className="text-muted-600 font-semibold text-lg">{route?.routeName}</Text>
                    <Feather name="arrow-right-circle" size={20} color={colors.secondary[500]} className="mx-2" />
                    <Text className="text-muted-600 font-semibold text-lg">Campus</Text>
                  </View>

                  {toCampusEmployee?.length > 0 ? (
                    toCampusEmployee?.map((schedule) => <ScheduleCard key={schedule?._id} schedule={schedule} />)
                  ) : (
                    <NoSchedule message="No bus schedule found for employees going to campus." />
                  )}
                </View>
                <View className="">
                  <View className="flex-row items-center justify-center bg-white px-4 py-1 rounded-2xl my-2 mt-5  border-muted-300">
                    <Text className="text-muted-600 font-semibold text-lg">Campus</Text>
                    <Feather name="arrow-right-circle" size={20} color={colors.secondary[500]} className="mx-2" />
                    <Text className="text-muted-600 font-semibold text-lg">{route?.routeName}</Text>
                  </View>

                  {fromCampusEmployee?.length > 0 ? (
                    fromCampusEmployee?.map((schedule) => <ScheduleCard key={schedule?._id} schedule={schedule} />)
                  ) : (
                    <NoSchedule message="No bus schedule found for employees leaving campus." />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default BusSchedule;
