import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { createStyles } from "../assets/styles/home.styles";
import { useSettings } from "../contexts/SettingsContext";
import { formatDate } from "../lib/utils";

const CATEGORY_ICONS = {
  "Food & Drinks": "fast-food",
  Shopping: "cart",
  Transportation: "car",
  Entertainment: "film",
  Bills: "receipt",
  Income: "cash",
  Other: "ellipsis-horizontal",
};

export const TransactionItem = ({ item, onDelete }) => {
  const { colors, t, isRTL } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isIncome = parseFloat(item.amount) > 0;
  const iconName = CATEGORY_ICONS[item.category] || "pricetag-outline";
  const displayCategory = t[item.category] || item.category;

  const rowStyle = isRTL ? { flexDirection: "row-reverse" } : {};
  const textStyle = isRTL ? { textAlign: "right" } : {};

  return (
    <View style={[styles.transactionCard, rowStyle]} key={item.id}>
      <TouchableOpacity style={[styles.transactionContent, rowStyle]}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={iconName} size={22} color={isIncome ? colors.income : colors.expense} />
        </View>
        <View style={styles.transactionLeft}>
          <Text style={[styles.transactionTitle, textStyle]}>{item.title}</Text>
          <Text style={[styles.transactionCategory, textStyle]}>{displayCategory}</Text>
        </View>
        <View style={[styles.transactionRight, isRTL && { alignItems: "flex-start" }]}>
          <Text
            style={[styles.transactionAmount, { color: isIncome ? colors.income : colors.expense }]}
          >
            {isIncome ? "+" : "-"}${Math.abs(parseFloat(item.amount)).toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.deleteButton,
          isRTL && { borderLeftWidth: 0, borderRightWidth: 1, borderRightColor: colors.border },
        ]}
        onPress={() => onDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={colors.expense} />
      </TouchableOpacity>
    </View>
  );
};
