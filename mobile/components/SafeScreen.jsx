import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/contexts/SettingsContext";

const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useSettings();

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: colors.background }}>
      {children}
    </View>
  );
};

export default SafeScreen;
