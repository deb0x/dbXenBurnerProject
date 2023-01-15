import { createContext } from "react";

export const initialThemeState = {
  theme: "dark",
  setTheme: (_value: string) => {}
};

const ThemeContext = createContext(initialThemeState);
export default ThemeContext;