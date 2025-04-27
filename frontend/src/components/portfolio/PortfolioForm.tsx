"use client";

import React, { useState } from "react";
import axios from "axios";
import TickerInput from "@/components/portfolio/TickerInput";
import { useResult } from "@/context/ResultContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { useRouter } from "next/navigation";
import AutoPortfolio from "@/components/portfolio/AutoPortfolio"; // Import the new component

type PortfolioEntry = {
  id: number;
  ticker: string;
  quantity: string;
};

const PortfolioForm: React.FC = () => {
  const [entries, setEntries] = useState<PortfolioEntry[]>([{ id: 0, ticker: "", quantity: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setResult } = useResult();
  const { setPortfolio } = usePortfolio();
  const router = useRouter();

  const handleTickerChange = (id: number, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, ticker: value } : entry)));
  };

  const handleQuantityChange = (id: number, value: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, quantity: value } : entry)));
  };

  const handleAddMore = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 0;
    setEntries([...entries, { id: newId, ticker: "", quantity: "" }]);
  };

  const handleRemove = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const handleClear = () => {
    setEntries([{ id: 0, ticker: "", quantity: "" }]); // Reset to a single empty entry
    setError(null); // Clear any existing errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const validEntries = entries.filter((entry) => entry.ticker.trim() && entry.quantity.trim());

      if (validEntries.length === 0) {
        throw new Error("Please add at least one valid portfolio entry");
      }

      setPortfolio(validEntries);

      const response = await axios.post(
        "http://localhost:5000/api/portfolio/process",
        validEntries.map((entry) => ({
          ticker: entry.ticker.trim().toUpperCase(),
          quantity: entry.quantity.trim(),
        })),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setResult(response.data);
      router.push("/result");
    } catch (err) {
      console.error("Error processing portfolio:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process portfolio. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
      <div className='max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-h-[90vh] flex flex-col'>
        <h2 className='text-2xl font-bold text-center text-gray-800 dark:text-white mb-6'>
          Your Portfolio
        </h2>

        {error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md'>{error}</div>}

        <form
          onSubmit={handleSubmit}
          className='flex flex-col flex-1 overflow-hidden'
        >
          <div className='flex-1 overflow-y-auto mb-4'>
            {entries.map((entry, index) => (
              <TickerInput
                key={entry.id}
                id={entry.id}
                ticker={entry.ticker}
                quantity={entry.quantity}
                onTickerChange={handleTickerChange}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                isLast={index === entries.length - 1}
                onAddMore={handleAddMore}
              />
            ))}
          </div>
          <div className='mt-auto pt-4 flex gap-4'>
            <button
              type='submit'
              disabled={isLoading}
              className={`flex-1 py-2 px-4 ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              } text-white font-medium rounded-md transition-colors`}
            >
              {isLoading ? "Processing..." : "Submit Portfolio"}
            </button>
            <button
              type='button'
              onClick={handleClear}
              className='flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors'
            >
              Clear
            </button>
          </div>
        </form>

        {/* Add the AutoPortfolio component */}
        <div className='mt-6'>
          <AutoPortfolio />
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;
