import { useResult } from "@/context/ResultContext";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { FiChevronLeft } from "react-icons/fi";

import { usePortfolio } from "@/context/PortfolioContext";
import { parseFormattedText } from "@/app/utils/textUtils";

type ImportantEventsProp = {
  setActiveFeature: (feature: number | null) => void;
};

const url = "https://api.asi1.ai/v1/chat/completions";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: "Bearer sk_ae9b780415204cf6be1528f8007a9cc83c2bdebf1784464abbd023951727a41e",
};

const result = {
  sector_with_most_growth_potential: "health_care",
  sector_with_least_growth_potential: "consumer_discretionary",
  growing_sectors: [
    "communication_services",
    "consumer_staples",
    "energy",
    "financials",
    "health_care",
    "industrials",
    "information_technology",
    "real_estate",
    "utilities",
  ],
  declining_sectors: ["consumer_discretionary", "materials"],
  top_5_events: [
    {
      event:
        "Tiny Maldives Bans Israelis From Vacation Paradise: Nearly 100 Percent Muslim Country\u2019s President Lashes Out at \u2018Atrocities\u2019 and \u2018Genocide\u2019 | The New York Sun",
      impact: 2.3374,
    },
    {
      event: "PM: US drug probe may be entrapment | The Tribune",
      impact: 4.8156,
    },
    {
      event:
        "City of Vandalia approves two development agreements at Monday Special Meeting | Vandalia Radio",
      impact: 3.0164,
    },
    {
      event:
        "Democrat Cyndi Munson announces bid for Oklahoma governor against growing field of Republicans",
      impact: 3.9592,
    },
    {
      event: "Malta Airport hails introduction of new routes ahead of the summer",
      impact: 6.72,
    },
  ],
  all_predictions: {
    communication_services: 0.6649,
    consumer_discretionary: -1.1284,
    consumer_staples: 0.2536,
    energy: 0.1755,
    financials: 0.7839,
    health_care: 1.1624,
    industrials: 0.2625,
    information_technology: 0.2694,
    materials: -0.6044,
    real_estate: 0.667,
    utilities: 0.0552,
  },
};

const MarketAnalysis: React.FC<ImportantEventsProp> = ({ setActiveFeature }) => {
  const { portfolio } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [recommendations, setRecommendations] = useState<string>("");

  const generateHistogram = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await fetch("http://localhost:5000/api/generate-histogram", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate histogram");
      }

      const data = await response.json();
      if (data.success) {
        setHasError(false);
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error generating histogram:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    if (!result || portfolio.length === 0) return;

    try {
      setIsLoading(true);
      setRecommendations(""); // Clear previous recommendations

      // Create a detailed prompt for the AI
      const portfolioSummary = portfolio
        .map((entry) => `${entry.ticker} (${entry.quantity} shares)`)
        .join(", ");
      const sectorSummary = Object.entries(result.all_predictions)
        .map(([sector, prediction]) => `${sector}: ${prediction.toFixed(2)}%`)
        .join(", ");
      const eventsSummary = result.top_5_events
        .map((event) => `Event: "${event.event}" with an impact of ${event.impact.toFixed(2)}%`)
        .join("\n");
      const growingSectors = result.growing_sectors.join(", ");
      const decliningSectors = result.declining_sectors.join(", ");

      const prompt = `
        Based on the following portfolio, sector predictions, and recent events, provide general investment recommendations:
        Portfolio: ${portfolioSummary}.
        Sector Predictions: ${sectorSummary}.
        Growing Sectors: ${growingSectors}.
        Declining Sectors: ${decliningSectors}.
        Recent Events:
        ${eventsSummary}.
      `;

      const payload = {
        model: "asi1-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
        stream: false, // Disable streaming
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json(); // Parse the entire response as JSON
      const reasoning = data.choices?.[0]?.message?.content; // Extract the recommendations content

      if (reasoning) {
        const recommendationsWithoutFirstLine = reasoning.split("\n").slice(2).join("\n");
        setRecommendations(recommendationsWithoutFirstLine); // Set the recommendations
      } else {
        setRecommendations("No recommendations available.");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations("Failed to fetch recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [portfolio]);

  useEffect(() => {
    if (result) {
      generateHistogram();
      fetchRecommendations();
    }
  }, [fetchRecommendations]);

  if (!result) {
    return <div className='text-gray-400'>Loading...</div>;
  }

  return (
    <div className='w-full'>
      <button
        onClick={() => setActiveFeature(null)}
        className='flex items-center text-gray-400 mb-6 hover:text-white transition-colors cursor-pointer'
      >
        <FiChevronLeft className='mr-1' /> Back to dashboard
      </button>

      <h2 className='text-3xl font-bold text-white mb-6'>Market Analysis</h2>

      <div className='grid grid-cols-1 gap-6 mb-8 auto-rows-auto'>
        {/* Growth Potential Section */}
        <div className='bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg h-[fit-content] '>
          <h3 className='text-xl font-semibold text-white mb-4'>Growth Potential</h3>
          <div className='flex justify-evenly gap-6'>
            <div className='bg-gray-700/30 rounded-lg p-4 w-full'>
              <p className='text-green-400 font-medium'>Highest Growth Potential</p>
              <p className='text-white capitalize mt-1'>
                {result.sector_with_most_growth_potential.replace(/_/g, " ")}
              </p>
              <p className='text-green-400 mt-2'>
                +{result.all_predictions[result.sector_with_most_growth_potential].toFixed(2)}%
              </p>
            </div>
            <div className='bg-gray-700/30 rounded-lg p-4 w-full'>
              <p className='text-red-400 font-medium'>Lowest Growth Potential</p>
              <p className='text-white capitalize mt-1'>
                {result.sector_with_least_growth_potential.replace(/_/g, " ")}
              </p>
              <p className='text-red-400 mt-2'>
                {result.all_predictions[result.sector_with_least_growth_potential].toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Sector Distribution Section */}
        <div className='bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg h-[fit-content]'>
          <h3 className='text-xl font-semibold text-white mb-4'>Sector Distribution</h3>
          <div className='rounded-lg flex items-center justify-center h-[fit-content]'>
            {isLoading ? (
              <div className='text-gray-400'>Generating histogram...</div>
            ) : hasError ? (
              <div className='text-red-400 flex flex-col items-center'>
                <p>Failed to load histogram</p>
                <button
                  onClick={generateHistogram}
                  className='mt-2 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors'
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className='flex flex-col gap-6'>
                <Image
                  src='/images/sector_histogram.png'
                  alt='Sector Distribution Histogram'
                  className='w-full h-[fit-content] p-2'
                  layout='responsive'
                  width={100}
                  height={50}
                />
                <button
                  onClick={generateHistogram}
                  className='mt-2 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors'
                >
                  Remake histogram
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className='bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg'>
        <h3 className='text-xl font-semibold text-white mb-4'>Recommendations</h3>
        {isLoading ? (
          <p className='text-gray-400'>Fetching recommendations...</p>
        ) : (
          <div className='text-gray-300 line leading-7'>
            {parseFormattedText(recommendations)}
            <br />
            <br /> If you would like to continue this conversation, please use the financial agent
            chatbot.
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;
