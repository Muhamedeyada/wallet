import { useClerk } from "@clerk/clerk-expo";
import { Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { createStyles } from "../assets/styles/home.styles";
import { useSettings } from "../contexts/SettingsContext";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSignOut = async () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.logout, style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
      <Ionicons name="log-out-outline" size={22} color={colors.text} />
    </TouchableOpacity>
  );
};
