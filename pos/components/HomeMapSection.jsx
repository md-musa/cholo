import React, {  useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapComponent from "@/components/MapComponent";
import StatusOverlayComponent from "@/components/UI/StatusOverlayComponent";
import { getCurrentRouteCenterCords } from "@/assets/routes";
import { useAppSelector } from "@/store/storeConfig";
import useLocation from "@/hook/useLocation";
import { MapUtils } from "@/utils/mapUtils";


const HomeMapSection = () => {
  const router = useRouter();
  const cameraRef = useRef(null);
  const { location } = useLocation();
  const { route } = useAppSelector((state) => state.auth);

  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(11);

  const [currentCenter, setCurrentCenter] = useState([90.320463, 23.879]);

  useEffect(() => {
    const routeCenter = getCurrentRouteCenterCords(route.routeNo);
    // console.log("Route Cener", routeCenter);
    if (routeCenter) {
      MapUtils.changeMapCenter(routeCenter, setCurrentCenter, setZoom, 11);
    }
  }, [route]);

  return (
    <View className="flex-1 relative mt-4 rounded-xl overflow-hidden border border-muted-300">
      <MapComponent
        zoom={zoom}
        setZoom={setZoom}
        cameraRef={cameraRef}
        mapRef={mapRef}
        currentCenter={currentCenter}
        setCurrentCenter={setCurrentCenter}
      />
      <StatusOverlayComponent />

      <TouchableOpacity className="absolute top-3 left-3 bg-white border border-muted-300 rounded-md shadow flex-row py-1 px-2 items-center justify-center">
        <MaterialIcons name="route" size={18} color="#4b4b4b" />
        <Text className="text-sm capitalize color-[#2c2c2c]"> {route?.routeName}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="absolute bottom-20 right-3 bg-white  border border-muted-300 rounded-full shadow flex-row p-3 items-center justify-center"
        onPress={() => MapUtils.centerToUserLocation(cameraRef, location, setZoom, setCurrentCenter, 15)}
        disabled={!location}
        style={{ opacity: location ? 1 : 0.5 }}
      >
        {/* <Text className="text-black text-base mx-2"></Text> */}
        <Ionicons name="locate" size={25} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        className="absolute bottom-6 right-3 bg-white border border-muted-300 rounded-full shadow-lg flex-row p-2 items-center justify-center"
        onPress={() => router.push("/home/watchBusLocation")}
      >
        <Text className="text-black text-base mx-2">Full Screen</Text>
        <Ionicons name="expand" size={22} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeMapSection;
