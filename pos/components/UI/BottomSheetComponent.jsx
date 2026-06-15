import React from "react";
import { View, Text, FlatList } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AvailableBusListCard from "./AvailableBusListCard";
import { MaterialIcons } from "@expo/vector-icons"; // or use any icon library you prefer

const BottomSheetComponent = ({ bottomSheetRef, activeBuses, closeBottomSheet, highlightBus }) => {
  
  return (
    <BottomSheet ref={bottomSheetRef} snapPoints={["30%", "50%", "60%", "75%", "90%"]} index={1}>
      <BottomSheetView className="px-5">
        <Text className="text-xl font-bold text-center my-2">Available buses</Text>

        {activeBuses && Object.keys(activeBuses).length > 0 ? (
          <FlatList
            data={Object.values(activeBuses)}
            renderItem={({ item }) => <AvailableBusListCard item={item} highlightBus={highlightBus} />}
            keyExtractor={(item) => item.trip?.busName ?? item.trip?.id ?? Math.random().toString()}
            className="w-full"
          />
        ) : (
          <View className="flex items-center justify-center my-8">
            <MaterialIcons name="directions-bus" size={48} color="#888" />
            <Text className="text-center mt-2 text-muted-500">No buses available</Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default BottomSheetComponent;
