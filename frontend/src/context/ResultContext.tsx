"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type ResultContextType = {
  result: string | null;
  setResult: (result: string | null) => void;
};

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<string | null>(null);

  return <ResultContext.Provider value={{ result, setResult }}>{children}</ResultContext.Provider>;
};

export const useResult = () => {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResult must be used within a ResultProvider");
  }
  return context;
};
