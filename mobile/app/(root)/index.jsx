import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import { useEffect, useMemo, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { createStyles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import { useSettings } from "../../contexts/SettingsContext";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { colors, t, isRTL, isDark, language, toggleTheme, toggleLanguage } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { transactions, summary, isLoading, loadData, deleteTransaction } = useTransactions(
    user.id
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Alert.alert(t.deleteTransaction, t.deleteTransactionConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.delete, style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  if (isLoading && !refreshing) return <PageLoader />;

  const rowStyle = isRTL ? { flexDirection: "row-reverse" } : {};
  const textStyle = isRTL ? { textAlign: "right" } : {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={[styles.header, rowStyle]}>
          {/* LEFT */}
          <View style={[styles.headerLeft, rowStyle]}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, textStyle]}>{t.welcome}</Text>
              <Text style={[styles.usernameText, textStyle]}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT */}
          <View style={[styles.headerRight, rowStyle]}>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>{t.add}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={18}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
              <Text style={styles.langToggleText}>{language === "en" ? "ع" : "EN"}</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        <BalanceCard summary={summary} />

        <View style={[styles.transactionsHeaderContainer, rowStyle]}>
          <Text style={[styles.sectionTitle, textStyle]}>{t.recentTransactions}</Text>
        </View>
      </View>

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}
