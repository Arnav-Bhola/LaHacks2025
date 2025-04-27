import React from "react";
import { FiChevronRight } from "react-icons/fi";

type FeatureCardsProps = {
  setActiveFeature: (feature: number | null) => void;
};

const FeatureCards: React.FC<FeatureCardsProps> = ({ setActiveFeature }) => {
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

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
      {/* Card 1 */}
      <div
        className=' bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]'
        onClick={() => setActiveFeature(1)}
      >
        <h3 className='text-xl font-semibold text-white mb-4'>Predicted Sector Growth</h3>
        <p className='text-blue-200 text-sm'>
          View detailed growth predictions for all market sectors
        </p>
        <div className='mt-4 flex justify-end'>
          <FiChevronRight className='text-white text-2xl' />
        </div>
      </div>

      {/* Card 2 */}
      <div
        className='bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]'
        onClick={() => setActiveFeature(2)}
      >
        <h3 className='text-xl font-semibold text-white mb-4'>Important Events</h3>
        <p className='text-blue-200 text-sm'>
          {result.top_5_events.length} significant events detected that may impact your portfolio
        </p>
        <div className='mt-4 flex justify-end'>
          <FiChevronRight className='text-white text-2xl' />
        </div>
      </div>

      {/* Card 3 */}
      <div
        className='bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]'
        onClick={() => setActiveFeature(3)}
      >
        <h3 className='text-xl font-semibold text-white mb-4'>Portfolio Analysis</h3>
        <p className='text-blue-200 text-sm'>
          Detailed breakdown of your portfolio&apos;s strengths and weaknesses
        </p>
        <div className='mt-4 flex justify-end'>
          <FiChevronRight className='text-white text-2xl' />
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
