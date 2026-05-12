import { View, Text } from "react-native";
import { useMemo } from "react";
import { createStyles } from "../assets/styles/home.styles";
import { useSettings } from "../contexts/SettingsContext";

export const BalanceCard = ({ summary }) => {
  const { colors, t } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>{t.totalBalance}</Text>
      <Text style={styles.balanceAmount}>${parseFloat(summary.balance).toFixed(2)}</Text>
      <View style={styles.balanceStats}>
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>{t.income}</Text>
          <Text style={[styles.balanceStatAmount, { color: colors.income }]}>
            +${parseFloat(summary.income).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.balanceStatItem, styles.statDivider]} />
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>{t.expenses}</Text>
          <Text style={[styles.balanceStatAmount, { color: colors.expense }]}>
            -${Math.abs(parseFloat(summary.expenses)).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};
