import { usePortfolio } from "@/context/PortfolioContext";
import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import EventCard from "./EventCard";

type ImportantEventsProp = {
  setActiveFeature: (feature: number | null) => void;
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

const ImportantEvents: React.FC<ImportantEventsProp> = ({ setActiveFeature }) => {
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
