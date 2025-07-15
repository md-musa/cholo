import { View, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import busImage from "@/assets/images/icon.png";

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-row justify-between items-center bg-white w-full py-2 mb-2">
      {/* Logo on the left */}
      <View className="flex-row items-center">
        {/* <Image source={busImage} className="rounded-full" resizeMode="contain" style={{ width: 35, height: 35 }} /> */}
        <Text className="text-black text-xl font-semibold">CHOLO</Text>
      </View>

      {/* Settings icon on the right */}
      <TouchableOpacity onPress={() => navigation.navigate("setting")} className="p-1">
        <Ionicons name="menu" size={27} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;
