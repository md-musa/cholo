import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LoadingScreen from "@/components/UI/LoadingScreen";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { useCreateTripMutation } from "@/store/features/trip/tripApi";
import { TripUtil } from "@/utils/tripUtil";
import { startBroadcasting } from "@/store/features/broadcast/broadcastSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_ROLES } from "@/constants";
import { colors } from "@/config/colors";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { ensureBackgroundLocationPermission } from "@/utils/askForBackgroundLocationPermission";
import { ToastUtil } from "@/utils/toastUtil";
import LiveMapLocation from "@/components/broadcast/LiveMapLocation";

const Index = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, route } = useAppSelector((state) => state.auth);
  const { isBroadcasting } = useAppSelector((state) => state.broadcast);
  const [createTrip, { isLoading: isCreatingTrip }] = useCreateTripMutation();
  const { data: buses, isLoading: isBusesLoading, error: busesError } = useGetBusesQuery();

  const [busType, setBusType] = useState("");
  const [direction, setDirection] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (busesError) {
      ToastUtil.error("Failed to load buses. Please try again later.");
    }
  }, [busesError]);

  const filteredBuses = TripUtil.searchBus(buses || [], searchQuery);
  const isValid = selectedBus && busType && direction;

  const handleStartSharing = async () => {
    if (!isValid) {
      ToastUtil.error("Please select a bus, bus type, and direction.");
      return;
    }

    const hasBgPermission = await ensureBackgroundLocationPermission();
    if (!hasBgPermission) return;

    Alert.alert("Confirm Sharing", `Start sharing location of ${selectedBus.name} (${busType}, ${direction})?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            const { data } = await createTrip({
              routeId: route._id,
              hostId: user._id,
              busName: selectedBus.name,
              busType: busType,
              note: note,
            });

            //console.log("🌊 Trip created:", data);

            dispatch(
              startBroadcasting({
                bus: selectedBus,
                tripId: data._id,
                busType,
                note,
              })
            );
            await AsyncStorage.setItem("tripId", data._id);

            // router.push("/home/broadcast/liveLocationSharing");
          } catch (error) {
            ToastUtil.error("Failed to start sharing. Please try again.");
          }
        },
      },
    ]);
  };

  if (isBusesLoading) return <LoadingScreen />;
  if (isBroadcasting) return <LiveMapLocation />;


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-muted-100">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-4" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-3 items-center">
          <Text className="text-md text-muted-800 text-center mt-2">
            Help the campus community track bus in real-time
          </Text>
          <Text className="text-sm text-center mt-2 bg-secondary-200 text-black rounded-md px-2">
            Current Route: <Text className="text-muted-700">{route.routeName}</Text>
          </Text>
        </View>

        {/* Bus Search */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-muted-300">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-muted-900">Select Bus</Text>
            {/* <MaterialIcons name="directions-bus" size={20} color="#4B5563" /> */}
          </View>

          <View className="flex-row items-center bg-muted-50 rounded-lg border border-muted-300 px-3 mb-4">
            <Ionicons name="search" size={18} color={colors.muted[500]} className="mr-2" />
            <TextInput
              className="flex-1 h-12 text-muted-900"
              placeholder="Search buses..."
              placeholderTextColor={colors.muted[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Bus List */}
          <ScrollView className="max-h-64" nestedScrollEnabled>
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus) => {
                const isSelected = selectedBus?._id === bus._id;
                return (
                  <TouchableOpacity
                    key={bus._id}
                    className={`border-b border-muted-300 py-2 px-3 my-1 rounded-lg ${
                      isSelected ? "bg-secondary-50 border border-secondary-500" : "bg-white"
                    }`}
                    onPress={() => setSelectedBus(bus)}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="bus" size={18} color={isSelected ? colors.secondary[500] : colors.muted[500]} />
                      <Text className="flex-1 text-md text-muted-900 ml-3 capitalize">{bus.name}</Text>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.secondary[500]} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="py-4 items-center">
                <MaterialIcons name="search-off" size={32} color={colors.muted[500]} />
                <Text className="text-muted-500 mt-2">No buses found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bus Type Select */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-muted-300">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-muted-900">Bus Type</Text>
          </View>
          <View className="flex-row justify-between space-x-3">
            <TouchableOpacity
              key={USER_ROLES.STUDENT}
              className={`flex-1 mx-1 p-2 rounded-xl items-center border ${
                busType === USER_ROLES.STUDENT ? "bg-secondary-50 border-secondary-500" : "bg-muted-50 border-muted-300"
              }`}
              onPress={() => setBusType(USER_ROLES.STUDENT)}
            >
              <View className="flex-row items-center justify-center">
                <FontAwesome5
                  name="user-graduate"
                  size={15}
                  color={busType === USER_ROLES.STUDENT ? colors.secondary[500] : colors.muted[500]}
                />
                <Text
                  className={`mx-1 capitalize text-sm font-medium ${
                    busType === USER_ROLES.STUDENT ? "text-secondary-700" : "text-muted-700"
                  }`}
                >
                  {USER_ROLES.STUDENT}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              key={USER_ROLES.EMPLOYEE}
              className={`flex-1 mx-1 p-2 rounded-xl items-center border ${
                busType === USER_ROLES.EMPLOYEE
                  ? "bg-secondary-50 border-secondary-500"
                  : "bg-muted-50 border-muted-300"
              }`}
              onPress={() => setBusType(USER_ROLES.EMPLOYEE)}
            >
              <View className="flex-row items-center justify-start">
                <MaterialCommunityIcons
                  name="account-tie"
                  size={20}
                  color={busType === USER_ROLES.EMPLOYEE ? colors.secondary[500] : colors.muted[500]}
                />
                <Text
                  className={`mx-1 capitalize text-sm font-medium ${
                    busType === USER_ROLES.EMPLOYEE ? "text-secondary-700" : "text-muted-700"
                  }`}
                >
                  {USER_ROLES.EMPLOYEE}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Direction Select */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-muted-300">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-muted-900">Bus Direction</Text>
          </View>
          <View className="flex-row justify-between space-x-3">
            {[
              { direction: "To Campus", icon: "arrow-up" },
              { direction: "From Campus", icon: "arrow-down" },
            ].map(({ direction: dir, icon }) => (
              <TouchableOpacity
                key={dir}
                className={`flex-1 p-2 mx-1 rounded-xl items-center border ${
                  direction === dir ? "bg-secondary-50 border-secondary-500" : "bg-muted-50 border-muted-300"
                }`}
                onPress={() => setDirection(dir)}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons
                    name={icon}
                    size={20}
                    color={direction === dir ? colors.secondary[500] : colors.muted[500]}
                  />
                  <Text
                    className={`mx-1 text-sm font-medium ${
                      direction === dir ? "text-secondary-700" : "text-muted-700"
                    }`}
                  >
                    {dir}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes
        <View className="bg-white rounded-xl p-4 shadow-sm border border-muted-300">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-muted-900">Additional Notes</Text>
            <Ionicons name="document-text" size={18} color="#4B5563" />
          </View>
          <TextInput
            className="h-20 p-3 bg-muted-50 rounded-lg border border-muted-300 text-muted-900"
            placeholder="Any special instructions or notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View> */}
        {/* Start Button Fixed at Bottom */}
        <TouchableOpacity
          className={`flex-row rounded-xl mt-4 p-2 items-center justify-center shadow-sm ${
            isValid ? "bg-secondary-600" : "bg-muted-400"
          }`}
          onPress={handleStartSharing}
          disabled={!isValid || isCreatingTrip}
        >
          {isCreatingTrip ? (
            <LoadingIndicator color="white" />
          ) : (
            <>
              <Ionicons name="location" size={22} color="white" />
              <Text className="text-white mx-2 text-lg font-bold">Start Sharing</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Index;
