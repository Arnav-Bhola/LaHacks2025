"use client";

import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import axios from "axios";

interface AutoPortfolioProps {
  onPortfolioGenerated: (portfolio: { ticker: string; quantity: string }[]) => void; // Callback to update the portfolio in PortfolioForm
}

const AutoPortfolio: React.FC<AutoPortfolioProps> = ({ onPortfolioGenerated }) => {
  const [prompt, setPrompt] = useState(""); // State to save the prompt
  const [loading, setLoading] = useState(false); // State to track loading
  const [error, setError] = useState<string | null>(null); // State to track errors

  const handleGeneratePortfolio = async () => {
    if (!prompt.trim()) {
      setError("Please enter a valid prompt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send the prompt to the backend
      const response = await axios.post("http://localhost:5000/api/generate-portfolio", {
        query: prompt,
      });

      // Transform the generated portfolio into the format expected by PortfolioForm
      const generatedPortfolio = response.data.portfolio.holdings.map((item: any) => ({
        ticker: item.ticker,
        quantity: item.quantity.toString(),
      }));

      // Pass the generated portfolio to PortfolioForm
      onPortfolioGenerated(generatedPortfolio);
    } catch (err: any) {
      console.error("Error generating portfolio:", err);
      setError(err.response?.data?.error || "Failed to generate portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-6">
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
        Don&apos;t know where to start? Let us generate a portfolio for you!
      </p>
      <div className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate a portfolio..."
          className="w-full p-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          onKeyPress={(e) => e.key === "Enter" && handleGeneratePortfolio()}
        />
        <button
          onClick={handleGeneratePortfolio}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          aria-label="Generate portfolio"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>
      {loading && <p className="text-blue-500 mt-4 text-center">Generating portfolio...</p>}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default AutoPortfolio;