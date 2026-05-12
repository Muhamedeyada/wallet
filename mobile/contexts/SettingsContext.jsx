import { createContext, useCallback, useContext, useState } from "react";
import { DARK_COLORS, LIGHT_COLORS } from "../constants/colors";
import { translations } from "../constants/translations";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isDark, setIsDark] = useState(false);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <SettingsContext.Provider
      value={{ colors, t, isRTL, isDark, language, toggleLanguage, toggleTheme }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};
