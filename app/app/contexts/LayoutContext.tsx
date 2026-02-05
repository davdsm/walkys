import { createContext, useContext, type ReactNode } from "react";
import type { LayoutData } from "~/lib/services/layout.service";

interface LayoutContextType {
  layout: LayoutData | null;
}

const LayoutContext = createContext<LayoutContextType>({ layout: null });

export function LayoutProvider({ children, layout }: { children: ReactNode; layout: LayoutData | null }) {
  return (
    <LayoutContext.Provider value={{ layout: layout ?? null }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
