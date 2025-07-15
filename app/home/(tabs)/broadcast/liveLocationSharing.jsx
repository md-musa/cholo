import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import StatusOverlayComponent from "@/components/UI/StatusOverlayComponent";
import { useRouter } from "expo-router";
import LoadingScreen from "@/components/UI/LoadingScreen";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { stopBroadcasting } from "@/store/features/broadcast/broadcastSlice";
import useLocation from "@/hook/useLocation";
import MapComponent from "@/components/MapComponent";
import { MapUtils } from "@/utils/mapUtils";
import broadcastGifImage from "@/assets/images/broadcast.gif";

function LiveLocationSharing() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { location } = useLocation();
  const { activeTrip } = useAppSelector((state) => state.broadcast);
  const { route } = useAppSelector((state) => state.auth);

  const [currentCenter, setCurrentCenter] = useState([90.320463, 23.879]);
  const [zoom, setZoom] = useState(18);
  const cameraRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      setCurrentCenter([location.longitude, location.latitude]);
    }
  }, [location]);

  const handleStopSharing = () => {
    Alert.alert(
      "Stop Sharing Live Location?",
      "Campus community members will no longer see this bus's live position",
      [
        {
          text: "Stay",
          style: "cancel",
        },
        {
          text: "Stop",
          onPress: () => {
            dispatch(stopBroadcasting());
            router.back();
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  if (!location || !route || !activeTrip) return <LoadingScreen />;

  return (
    <View className="flex-1 bg-muted-100">
      <StatusBar barStyle="light-content" hidden={true} />

      <MapComponent
        mapRef={mapRef}
        cameraRef={cameraRef}
        zoom={zoom}
        setZoom={setZoom}
        currentCenter={currentCenter}
        setCurrentCenter={setCurrentCenter}
      />

      <StatusOverlayComponent />

      <TouchableOpacity
        className="absolute bottom-60 right-5 bg-white border border-muted-300 rounded-full shadow flex-row p-3 items-center justify-center"
        onPress={() => MapUtils.centerToUserLocation(cameraRef, location, setZoom, setCurrentCenter)}
        disabled={!location}
      >
        <Ionicons name="locate" size={28} color="black" />
      </TouchableOpacity>

      {/* <TouchableOpacity
        className="absolute top-10 left-5 bg-white border border-muted-300 rounded-full shadow flex-row p-2 items-center justify-center"
        // onPress={handleStopSharing}
      >
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity> */}

      {/*-------Route Details---------*/}
      <View className="px-4 mb-4">
        {/* Info Card */}
        <View className="bg-white p-4 mt-4 rounded-2xl shadow-md flex-row items-center space-x-3">
          {/* Alert Icon */}
          <View className="flex-[0.15] items-center mr-2">
            <Image source={broadcastGifImage} style={{ width: 44, height: 44 }} resizeMode="contain" />
          </View>

          {/* Info Text */}
          <View className="flex-[0.65]">
            <Text className="text-sm text-muted-700">
              Sharing <Text className="font-bold capitalize">{activeTrip.bus.name}</Text>'s location for the
              <Text className="font-bold"> {route?.routeName}</Text> route
            </Text>
          </View>

          {/* Speed */}
          <View className="flex-[0.2] items-end">
            <View className="bg-muted-100 px-2 py-1 rounded-lg">
              <Text className="text-sm font-medium text-muted-800">{Math.ceil(location.speed * 3.6)} km/h</Text>
            </View>
          </View>
        </View>

        {/* Stop Sharing Button */}
        <TouchableOpacity
          className="bg-red-700 py-2 rounded-xl shadow-md mt-6 mb-5 active:opacity-80"
          onPress={handleStopSharing}
        >
          <Text className="text-white text-center font-semibold text-lg">Stop Sharing Bus Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LiveLocationSharing;
