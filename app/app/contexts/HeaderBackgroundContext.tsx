import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface HeaderBackgroundContextType {
  /** When true, header should use light/inverted logo and menu (e.g. on black hero) */
  isDarkBackground: boolean;
  setDarkBackground: (value: boolean) => void;
}

const HeaderBackgroundContext = createContext<HeaderBackgroundContextType | undefined>(undefined);

export function HeaderBackgroundProvider({ children }: { children: ReactNode }) {
  const [isDarkBackground, setState] = useState(false);
  const setDarkBackground = useCallback((value: boolean) => setState(value), []);
  return (
    <HeaderBackgroundContext.Provider value={{ isDarkBackground, setDarkBackground }}>
      {children}
    </HeaderBackgroundContext.Provider>
  );
}

export function useHeaderBackground(): HeaderBackgroundContextType {
  const ctx = useContext(HeaderBackgroundContext);
  if (ctx === undefined) {
    return {
      isDarkBackground: false,
      setDarkBackground: () => {},
    };
  }
  return ctx;
}
