import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { createStyles } from "@/assets/styles/auth.styles.js";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSettings } from "../../contexts/SettingsContext";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { colors, t, isRTL } = useSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const textStyle = isRTL ? { textAlign: "right" } : {};
  const rowStyle = isRTL ? { flexDirection: "row-reverse" } : {};

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError(t.emailInUse);
      } else {
        setError(t.errorOccurred);
      }
      console.log(err);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>{t.verifyEmail}</Text>

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
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder={t.enterVerificationCode}
          placeholderTextColor={colors.textLight}
          onChangeText={setCode}
        />

        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text style={styles.buttonText}>{t.verify}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/revenue-i2.png")} style={styles.illustration} />

        <Text style={styles.title}>{t.createAccount}</Text>

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
          placeholderTextColor={colors.textLight}
          placeholder={t.enterEmail}
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

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>{t.signUp}</Text>
        </TouchableOpacity>

        <View style={[styles.footerContainer, rowStyle]}>
          <Text style={styles.footerText}>{t.alreadyHaveAccount}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>{t.signInLink}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
