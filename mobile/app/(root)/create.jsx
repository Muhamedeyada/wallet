import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useMemo, useState } from "react";
import { API_URL } from "../../constants/api";
import { createStyles } from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../../contexts/SettingsContext";

// IDs match what's stored in the database (always English)
const CATEGORIES = [
  { id: "Food & Drinks", icon: "fast-food" },
  { id: "Shopping", icon: "cart" },
  { id: "Transportation", icon: "car" },
  { id: "Entertainment", icon: "film" },
  { id: "Bills", icon: "receipt" },
  { id: "Income", icon: "cash" },
  { id: "Other", icon: "ellipsis-horizontal" },
];

const CreateScreen = () => {
  const router = useRouter();
  const { user } = useUser();
  const { colors, t, isRTL } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const textStyle = isRTL ? { textAlign: "right" } : {};
  const rowStyle = isRTL ? { flexDirection: "row-reverse" } : {};

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert(t.error, t.enterTitle);
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert(t.error, t.enterAmount);
      return;
    }
    if (!selectedCategory) return Alert.alert(t.error, t.selectCategory);

    setIsLoading(true);
    try {
      const formattedAmount = isExpense
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          title,
          amount: formattedAmount,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.failedCreate);
      }

      Alert.alert(t.success, t.transactionCreated);
      router.back();
    } catch (error) {
      Alert.alert(t.error, error.message || t.failedCreate);
      console.error("Error creating transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, rowStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.newTransaction}</Text>
        <TouchableOpacity
          style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.saveButton}>{isLoading ? t.saving : t.save}</Text>
          {!isLoading && <Ionicons name="checkmark" size={18} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={[styles.typeSelector, rowStyle]}>
          {/* EXPENSE SELECTOR */}
          <TouchableOpacity
            style={[styles.typeButton, isExpense && styles.typeButtonActive]}
            onPress={() => setIsExpense(true)}
          >
            <Ionicons
              name="arrow-down-circle"
              size={22}
              color={isExpense ? colors.white : colors.expense}
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>
              {t.expense}
            </Text>
          </TouchableOpacity>

          {/* INCOME SELECTOR */}
          <TouchableOpacity
            style={[styles.typeButton, !isExpense && styles.typeButtonActive]}
            onPress={() => setIsExpense(false)}
          >
            <Ionicons
              name="arrow-up-circle"
              size={22}
              color={!isExpense ? colors.white : colors.income}
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>
              {t.income}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AMOUNT CONTAINER */}
        <View style={[styles.amountContainer, rowStyle]}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.textLight}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        {/* INPUT CONTAINER */}
        <View style={[styles.inputContainer, rowStyle]}>
          <Ionicons
            name="create-outline"
            size={22}
            color={colors.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, textStyle]}
            placeholder={t.transactionTitle}
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
            textAlign={isRTL ? "right" : "left"}
          />
        </View>

        <Text style={[styles.sectionTitle, textStyle]}>
          {t.category}
        </Text>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? colors.white : colors.text}
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}
              >
                {t[category.id] || category.id}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};
export default CreateScreen;
