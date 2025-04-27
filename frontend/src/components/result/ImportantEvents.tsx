import { useResult } from "@/context/ResultContext";
import { usePortfolio } from "@/context/PortfolioContext";
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import EventCard from "./EventCard";

type ImportantEventsProp = {
  setActiveFeature: (feature: number | null) => void;
};

const ImportantEvents: React.FC<ImportantEventsProp> = ({ setActiveFeature }) => {
  const { result } = useResult() as {
    result: {
      top_5_events: { id: number; event: string; impact: string }[];
      all_predictions: Record<string, number>;
    } | null;
  };

  const { portfolio } = usePortfolio(); // Access the portfolio context

  if (!result) {
    return <div>Loading...</div>;
  }

  // Sort events by impact score in descending order
  const sortedEvents = [...result.top_5_events].sort((a, b) => Number(b.impact) - Number(a.impact));

  return (
    <div className='w-full'>
      <button
        onClick={() => setActiveFeature(null)}
        className='flex items-center text-blue-300 mb-6 hover:text-white transition-colors cursor-pointer'
      >
        <FiChevronLeft className='mr-1' /> Back to dashboard
      </button>

      <h2 className='text-2xl font-bold text-white mb-6'>Important Events to Monitor</h2>

      <div className='space-y-4'>
        {sortedEvents.map((event) => (
          <EventCard
            key={event.event}
            event={event}
            portfolio={portfolio}
            sectorPredictions={result.all_predictions}
          />
        ))}
      </div>
    </div>
  );
};

export default ImportantEvents;
