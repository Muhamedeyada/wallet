import { View, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { createStyles } from "../assets/styles/home.styles";
import { useSettings } from "../contexts/SettingsContext";

const PageLoader = () => {
  const { colors } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};
export default PageLoader;
