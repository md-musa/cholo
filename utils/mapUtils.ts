function centerToUserLocation(cameraRef: any, location: any, setZoom: any, setCurrentCenter: any, zoom: 15) {
  if (!location) return;
  setZoom(zoom);
  setCurrentCenter([location.longitude, location.latitude]);
}

function changeMapCenter(cords: [number, number], setCurrentCenter: any, setZoom: any, zoomLevel: 11) {
  if (cords.length) {
    const trimmedCenter = [parseFloat(cords[0].toFixed(4)), parseFloat(cords[1].toFixed(4))];
    setCurrentCenter(trimmedCenter);
    setZoom(zoomLevel);
  }
}

const highlightBus = (cameraRef: any, setZoom: any, setCurrentCenter: any, cord: any) => {
  setZoom(15);
  setCurrentCenter([...cord]);
};

const handleRegionDidChange = async (
  mapRef: any,
  zoom: any,
  setZoom: any,
  currentCenter: any,
  setCurrentCenter: any
) => {
  if (!mapRef.current) return;

  try {
    const center = await mapRef.current.getCenter();
    const currentZoom = await mapRef.current.getZoom();

    const trimmedCenter = [parseFloat(center[0].toFixed(4)), parseFloat(center[1].toFixed(4))];
    const trimmedZoom = parseFloat(currentZoom.toFixed(2));
    if (trimmedCenter[0] === currentCenter[0] && trimmedCenter[1] === currentCenter[1] && trimmedZoom === zoom) {
      return;
    }

    setCurrentCenter(trimmedCenter);
    setZoom(trimmedZoom);
  } catch (error) {
    console.warn("Map region change error:", error);
  }
};

export const MapUtils = {
  centerToUserLocation,
  highlightBus,
  handleRegionDidChange,
  changeMapCenter,
};
