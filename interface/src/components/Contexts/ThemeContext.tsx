import { createContext } from "react";

export const initialThemeState = {
  theme: "classic",
  setTheme: (_value: string) => {}
};

const ThemeContext = createContext(initialThemeState);
export default ThemeContext;