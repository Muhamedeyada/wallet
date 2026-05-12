import { Slot } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar } from "expo-status-bar";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";

function AppContent() {
  const { isDark } = useSettings();
  return (
    <>
      <SafeScreen>
        <Slot />
      </SafeScreen>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <AppContent />
      </ClerkProvider>
    </SettingsProvider>
  );
}
