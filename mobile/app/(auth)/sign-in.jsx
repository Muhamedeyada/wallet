import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useMemo, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createStyles } from "../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../../contexts/SettingsContext";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { colors, t, isRTL } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const textStyle = isRTL ? { textAlign: "right" } : {};
  const rowStyle = isRTL ? { flexDirection: "row-reverse" } : {};

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError(t.passwordIncorrect);
      } else {
        setError(t.errorOccurred);
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/revenue-i4.png")} style={styles.illustration} />
        <Text style={styles.title}>{t.welcomeBack}</Text>

        {error ? (
          <View style={[styles.errorBox, rowStyle]}>
            <Ionicons name="alert-circle" size={20} color={colors.expense} />
            <Text style={[styles.errorText, textStyle]}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorInput, textStyle]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder={t.enterEmail}
          placeholderTextColor={colors.textLight}
          onChangeText={setEmailAddress}
          textAlign={isRTL ? "right" : "left"}
        />

        <TextInput
          style={[styles.input, error && styles.errorInput, textStyle]}
          value={password}
          placeholder={t.enterPassword}
          placeholderTextColor={colors.textLight}
          secureTextEntry={true}
          onChangeText={setPassword}
          textAlign={isRTL ? "right" : "left"}
        />

        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>{t.signIn}</Text>
        </TouchableOpacity>

        <View style={[styles.footerContainer, rowStyle]}>
          <Text style={styles.footerText}>{t.noAccount}</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>{t.signUpLink}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
