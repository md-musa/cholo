import React, { useRef, useState, useEffect } from "react";
import { View, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import useLocation from "@/hook/useLocation";
import MapComponent from "@/components/MapComponent";
import StatusOverlayComponent from "@/components/UI/StatusOverlayComponent";
import BottomSheetComponent from "@/components/UI/BottomSheetComponent";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppSelector } from "@/store/storeConfig";
import { getCurrentRouteCenterCords } from "@/assets/routes";
import { MapUtils } from "@/utils/mapUtils";

const WatchBusLocation = () => {
  const router = useRouter();
  const paramsData = useLocalSearchParams();
  const { route } = useAppSelector((state) => state.auth);

  const bottomSheetRef = useRef(null);
  const { location } = useLocation();
  const [zoom, setZoom] = useState(11);

  const cameraRef = useRef(null);
  const mapRef = useRef(null);

  const [currentCenter, setCurrentCenter] = useState(() => {
    if (route && route.routeNo) {
      const routeCenter = getCurrentRouteCenterCords(route.routeNo);
      if (routeCenter) return routeCenter;
    }
    return [90.320463, 23.879];
  });

  useEffect(() => {
    if (paramsData.longitude && paramsData.latitude) {
      MapUtils.highlightBus([parseFloat(paramsData.longitude), parseFloat(paramsData.latitude)]);
    }
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View className="relative flex-1">
        <MapComponent
          mapRef={mapRef}
          zoom={zoom}
          cameraRef={cameraRef}
          setZoom={setZoom}
          currentCenter={currentCenter}
          setCurrentCenter={setCurrentCenter}
        />
        <StatusOverlayComponent />

        <TouchableOpacity
          className="absolute bottom-80 right-5 bg-white border border-muted-300 rounded-full shadow flex-row p-3 items-center justify-center"
          onPress={() => MapUtils.centerToUserLocation(cameraRef, location, setZoom, setCurrentCenter, 15)}
          disabled={!location}
        >
          <Ionicons name="locate" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          className="absolute top-10 left-5 bg-white border border-muted-300 rounded-full shadow flex-row p-2 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={25} color="black" />
        </TouchableOpacity>
      </View>

      <BottomSheetComponent
        bottomSheetRef={bottomSheetRef}
        highlightBus={() => {
          const longitude = parseFloat(paramsData.longitude);
          const latitude = parseFloat(paramsData.latitude);
          if (!isNaN(longitude) && !isNaN(latitude)) {
            MapUtils.highlightBus([longitude, latitude]);
          }
        }}
        closeBottomSheet={() => bottomSheetRef.current?.close()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gray",
  },
});

export default WatchBusLocation;
