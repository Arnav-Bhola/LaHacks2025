import { useResult } from "@/context/ResultContext";
import React from "react";
import { FiChevronRight } from "react-icons/fi";

type FeatureCardsProps = {
  setActiveFeature: (feature: number | null) => void;
};

const FeatureCards: React.FC<FeatureCardsProps> = ({ setActiveFeature }) => {
  const { result } = useResult() as {
    result: { top_5_events: { id: number; name: string; impact: string }[] } | null;
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
