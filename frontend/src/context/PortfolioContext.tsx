"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

type PortfolioEntry = {
  id: number;
  ticker: string;
  quantity: string;
};

type PortfolioContextType = {
  portfolio: PortfolioEntry[];
  setPortfolio: (portfolio: PortfolioEntry[]) => void;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
