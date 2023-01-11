import { useState, useEffect } from "react";
import ThemeContext, { initialThemeState } from "./ThemeContext";

type Props = {
    children: JSX.Element|JSX.Element[],
};

const ThemeProvider = ( { children }: Props ) => {
  const [theme, setTheme] = useState<any>(initialThemeState.theme);

  const localStorage = window.localStorage;

  useEffect(() => {
    const savedThemeLocal = localStorage.getItem("globalTheme");

    if (!!savedThemeLocal) {
      setTheme(savedThemeLocal);
    }
  }, [localStorage]);

  useEffect(() => {
    localStorage.setItem("globalTheme", theme);
  }, [theme, localStorage]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme theme--${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
