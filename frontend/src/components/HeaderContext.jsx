import React, { createContext, useState, useCallback } from "react";

export const HeaderContext = createContext();

export function HeaderProvider({ children }) {
  const [headerData, setHeaderData] = useState({
    title: "Dashboard",
    icon: null,
  });

  const setHeader = useCallback((title, icon = null) => {
    setHeaderData({ title, icon });
  }, []);

  return (
    <HeaderContext.Provider value={{ headerData, setHeader }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = React.useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader doit être utilisé dans HeaderProvider");
  }
  return context;
}