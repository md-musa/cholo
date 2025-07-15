import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as MapLibreGL from "@maplibre/maplibre-react-native";
import { generateMarkers } from "@/utils/mappingHelper";
import busMarker from "@/assets/images/navigatorArrow3.png";
import UniIcon from "@/assets/images/uni-2.png";
import pinIcon from "@/assets/images/red-pin-marker.png";
import busMarkerGreen from "@/assets/images/navigatorArrow2.png";
import { useAppSelector } from "@/store/storeConfig";
import { getWayline, getWaypoints, ROUTES } from "@/assets/routes";
import useLocation from "@/hook/useLocation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MapUtils } from "@/utils/mapUtils";
function cpfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const MapComponent = ({ mapRef, zoom, setZoom, cameraRef, currentCenter, setCurrentCenter }) => {
  const { location } = useLocation();
  const { route } = useAppSelector((state) => state.auth);
  const { isBroadcasting, activeTrip } = useAppSelector((state) => state.broadcast);
  const { activeBuses } = useAppSelector((state) => state.busLocation);
  const [busInfo, setBusInfo] = useState(null);
  const waypoints = getWaypoints(route?.routeNo);
  // console.log("[Mapcomponent rerendered]");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
      // console.log("Map fully loaded [3s passed]");
    }, 3000);
  }, []);

  return (
    <MapLibreGL.MapView
      localizeLabels={true}
      logoEnabled={true}
      compassEnabled={true}
      compassViewMargins={{ x: 5, y: 100 }}
      styleURL={MapLibreGL.StyleURL.Street}
      textureMode={false}
      attributionEnabled={true}
      style={styles.map}
      ref={mapRef}
      // if map is fully loaded, then hanlderegiondidchange will be calable

      onRegionDidChange={
        loaded ? () => MapUtils.handleRegionDidChange(mapRef, zoom, setZoom, currentCenter, setCurrentCenter) : null
      }
    >
      {/*------ Recentering map -------- */}
      <MapLibreGL.Camera
        centerCoordinate={currentCenter} // Default to DIU campus coordinates
        animationMode="flyTo"
        maxZoomLevel={20}
        minZoomLevel={8}
        ref={cameraRef}
        zoomLevel={zoom}
      />
      {/* --------- Load tile --------- */}
      <MapLibreGL.RasterSource
        id="osm"
        tileUrlTemplates={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
        tileSize={256}
      >
        <MapLibreGL.RasterLayer id="osmLayer" sourceID="osm" />
      </MapLibreGL.RasterSource>
      {/* ----- Route highlighter ------ */}
      <MapLibreGL.ShapeSource id="routeSource" shape={getWayline(route?.routeNo)}>
        <MapLibreGL.LineLayer
          id="routeLayer"
          style={{ lineColor: "#2e2e2e", lineWidth: 2, lineCap: "round", lineJoin: "round" }}
        />
      </MapLibreGL.ShapeSource>
      {/* ---- Image Load ------ */}
      <MapLibreGL.Images images={{ marker: busMarker, UniIcon: UniIcon, pinIcon: pinIcon, busMarkerGreen }} />
      {/* ------- Stopages --------- */}
      {waypoints && (
        <MapLibreGL.ShapeSource
          id="userLocation-4"
          shape={{
            type: "FeatureCollection",
            features: waypoints.map((point) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: point.coords,
              },
              properties: {
                title: point.location,
              },
            })),
          }}
        >
          <MapLibreGL.CircleLayer id="userDot-4" style={styles.stopageDot} />
          <MapLibreGL.SymbolLayer id="stopageLabels" style={styles.stopageInfo} />
        </MapLibreGL.ShapeSource>
      )}
      {/* ------ University and Trasnport Location Symbol */}
      <MapLibreGL.ShapeSource
        id="userLocation-2"
        shape={{
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [90.320463, 23.879],
              },
              properties: {
                icon: "UniIcon", // matches the key in MapLibreGL.Images
                title: "DIU Campus",
              },
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [90.322004, 23.876107],
              },
              properties: {
                icon: "pinIcon", // matches the key in MapLibreGL.Images
                title: "Transport",
              },
            },
          ],
        }}
      >
        <MapLibreGL.SymbolLayer
          id="customMarkerLayer"
          style={{
            iconImage: ["get", "icon"],
            iconSize: 0.06,
            iconAllowOverlap: true,
            textField: ["get", "title"], // shows "DIU"
            textSize: 15,
            textOffset: [0, -2.5], // adjust label position below the icon
            textAnchor: "top",
            textAllowOverlap: false,
            textColor: "#000", // label text color
          }}
        />
      </MapLibreGL.ShapeSource>
      {/* -----Show buses location-------*/}
      <MapLibreGL.ShapeSource
        id="busMarkers"
        shape={{ type: "FeatureCollection", features: generateMarkers(activeBuses) }}
        onPress={(e) => {
          setBusInfo(e.features[0]);
          setTimeout(() => setBusInfo(null), 3000);
        }}
      >
        <MapLibreGL.CircleLayer id="userShadow2" style={styles.busShadow1} />
        <MapLibreGL.CircleLayer id="userShadow3" style={styles.busShadow2} />
        <MapLibreGL.CircleLayer id="userShadow4" style={styles.busShadow3} />
        <MapLibreGL.SymbolLayer id="busMarkerLayer" style={styles.busMarker} />
      </MapLibreGL.ShapeSource>
      {/* --------- Show user location ----------*/}

      {location && !isBroadcasting && (
        <MapLibreGL.ShapeSource
          id="userLocation-666"
          shape={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [location.longitude, location.latitude],
                },
              },
            ],
          }}
        >
          <MapLibreGL.CircleLayer id="userShadow-777" style={styles.userShadow} />
          <MapLibreGL.CircleLayer id="userDot-888" style={styles.userDot} />
        </MapLibreGL.ShapeSource>
      )}

      {isBroadcasting && activeTrip && location && (
        <MapLibreGL.ShapeSource
          id="currentBusLocation-111"
          shape={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [location.longitude, location.latitude],
                },
                properties: {
                  title: `You\n${cpfl(activeTrip.bus.name)}\n${cpfl(activeTrip.busType)} bus`,
                  heading: location.heading,
                },
              },
            ],
          }}
        >
          <MapLibreGL.CircleLayer id="currentBusLocation-2222" style={styles.currentBusShadow1} />
          <MapLibreGL.CircleLayer id="currentBusLocation-3333" style={styles.currentBusShadow2} />
          <MapLibreGL.CircleLayer id="currentBusLocation-4444" style={styles.currentBusShadow3} />
          <MapLibreGL.SymbolLayer id="currentBusMarker-55555" style={styles.currentBusMarker} />
        </MapLibreGL.ShapeSource>
      )}

      {/* --------------Show bus details (callout) -------------- */}
      {busInfo && busInfo.geometry && (
        <MapLibreGL.MarkerView coordinate={busInfo.geometry.coordinates}>
          <MapLibreGL.Callout>
            <View style={styles.calloutContainer}>
              <MaterialCommunityIcons name="bus" size={20} color="#e58134" style={{ marginBottom: 2 }} />
              <Text style={styles.calloutDescription} className="capitalize">
                {busInfo.properties.title}
              </Text>
            </View>
          </MapLibreGL.Callout>
        </MapLibreGL.MarkerView>
      )}
    </MapLibreGL.MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },

  markerContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 8,
  },
  markerImage: { width: 32, height: 32 },
  markerLabel: { fontSize: 12, marginTop: 2 },

  busShadow1: {
    circleRadius: 17,
    circleColor: "rgba(229, 129, 52, 0.4)",
    circleBlur: 0,
  },
  busShadow2: {
    circleRadius: 12,
    circleColor: "#fff",
    circleBlur: 0,
  },
  busShadow3: {
    circleRadius: 10,
    circleColor: "black",
    circleBlur: 0,
  },
  busMarker: {
    iconImage: "marker",
    iconSize: 0.025,
    iconAnchor: "center",
    iconRotate: ["get", "heading"],
    textField: ["get", "title"],
    textSize: 11,
    textColor: "black",
    textAnchor: "bottom",
    textOffset: [0, 5.25],
    textHaloColor: "black",
    textHaloWidth: 0.1,
    textRotate: ["get", "heading"], // This will rotate the label with the marker heading
  },
  currentBusShadow1: {
    circleRadius: 18,
    circleColor: "rgba(0, 50, 255, 0.2)",
    circleBlur: 0,
  },
  currentBusShadow2: {
    circleRadius: 12,
    circleColor: "#fff",
    circleBlur: 0,
  },
  currentBusShadow3: {
    circleRadius: 10,
    circleColor: "#000f50c9",
    circleBlur: 0,
  },
  currentBusMarker: {
    iconImage: "busMarkerGreen",
    iconSize: 0.028,
    iconAnchor: "center",
    iconRotate: ["get", "heading"],
    textField: ["get", "title"],
    textSize: 11,
    textColor: "black",
    textAnchor: "bottom",
    textOffset: [0, 5.25],
    textHaloColor: "black",
    textHaloWidth: 0.1,
    textRotate: ["get", "heading"], // This will rotate the label with the marker heading
  },
  userShadow: {
    circleRadius: 20,
    circleColor: "rgba(0, 50, 255, 0.3)",
    circleBlur: 0,
  },
  userDot: {
    circleRadius: 5,
    circleColor: "blue",
    circleStrokeColor: "white",
    circleStrokeWidth: 2,
  },

  stopageDot: {
    circleRadius: 3,
    circleColor: "black",
    circleStrokeColor: "white",
    circleStrokeWidth: 1,
  },
  stopageInfo: {
    textField: ["get", "title"],
    textSize: 8,
    textColor: "black",
    textAnchor: "right",
    textHaloColor: "black",
    textHaloWidth: 0.1,
    textOffset: [-0.8, 0.2],
  },
  pointMarker: {
    iconImage: "customMarker",
    iconSize: 0.5,
    iconAllowOverlap: true,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  calloutDescription: {
    fontSize: 12,
  },
  calloutContainer: {
    backgroundColor: "white",
    padding: 3,
    borderRadius: 6,
    borderColor: "gray",
    borderWidth: 1,
  },
});

export default MapComponent;
