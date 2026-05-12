import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { createStyles } from "../assets/styles/home.styles";
import { useSettings } from "../contexts/SettingsContext";
import { useRouter } from "expo-router";

const NoTransactionsFound = () => {
  const router = useRouter();
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="receipt-outline"
        size={60}
        color={colors.textLight}
        style={styles.emptyStateIcon}
      />
      <Text style={styles.emptyStateTitle}>{t.noTransactions}</Text>
      <Text style={styles.emptyStateText}>{t.noTransactionsDesc}</Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push("/create")}>
        <Ionicons name="add-circle" size={18} color={colors.white} />
        <Text style={styles.emptyStateButtonText}>{t.addTransaction}</Text>
      </TouchableOpacity>
    </View>
  );
};
export default NoTransactionsFound;
