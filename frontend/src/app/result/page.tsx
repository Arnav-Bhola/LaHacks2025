"use client";

import React, { useState } from "react";
import { useResult } from "@/context/ResultContext";
import RiskIndicator from "@/components/result/RiskIndicator";
import FeatureCards from "@/components/result/FeatureCards";
import SectorGrowth from "@/components/result/SectorGrowth";
import ImportantEvents from "@/components/result/ImportantEvents";
import MarketAnalysis from "@/components/result/MarketAnalysis";
import QuickSend from "@/components/chatbot/QuickSend";

const ResultDisplay: React.FC = () => {
  // Get the Type of result to match what we need
  const { result } = useResult() as {
    result: {
      top_5_events: { id: number; name: string; impact: string }[];
      all_predictions: Record<string, number>;
    } | null;
  };
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  // Sends a messsage to the chatbot
  const handleSendMessage = () => {
    console.log("Message sent:", message);
    setMessage("");
  };

  if (!result) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
        <div className='bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-8 shadow-xl'>
          <h2 className='text-xl font-bold text-white'>
            No result available yet. Please submit your portfolio first.
          </h2>
        </div>
      </div>
    );
  }

  const riskLevel =
    Object.values(result.all_predictions as Record<string, number>).filter((val) => val < 0)
      .length > 3
      ? "High"
      : "Low";

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        <RiskIndicator riskLevel={riskLevel} />
        {activeFeature === null && <FeatureCards setActiveFeature={setActiveFeature} />}

        {/* Predictions for each sector */}
        {activeFeature === 1 && <SectorGrowth setActiveFeature={setActiveFeature} />}

        {/* Top events and how they impact the portfolio */}
        {activeFeature === 2 && <ImportantEvents setActiveFeature={setActiveFeature} />}

        {/* All information generated by the backend */}
        {activeFeature === 3 && <MarketAnalysis setActiveFeature={setActiveFeature} />}

        {/* Quick form to talk to the chatbot */}
        <QuickSend onSend={handleSendMessage} />

        {/* Disclaimer that responses are ai-generated */}
        <div className='mt-8 p-4 bg-gray-800 rounded-lg shadow-md'>
          <p className='text-yellow-400 text-center font-medium'>
            Heads up! This content was AI-generated—double-check anything important just to be sure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
