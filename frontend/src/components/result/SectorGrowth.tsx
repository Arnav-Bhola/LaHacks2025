import { useResult } from "@/context/ResultContext";
import React from "react";
import { FiArrowUp, FiArrowDown, FiChevronLeft } from "react-icons/fi";

type SectorGrowthProps = {
  setActiveFeature: (feature: number | null) => void;
};

const SectorGrowth: React.FC<SectorGrowthProps> = ({ setActiveFeature }) => {
  const { result } = useResult() as {
    result: {
      top_5_events: { id: number; name: string; impact: string }[];
      all_predictions: Record<string, number>;
    } | null;
  };

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full'>
      <button
        onClick={() => setActiveFeature(null)}
        className='flex items-center text-blue-300 mb-6 hover:text-white transition-colors cursor-pointer'
      >
        <FiChevronLeft className='mr-1' /> Back to dashboard
      </button>

      <h2 className='text-2xl font-bold text-white mb-6'>Predicted Sector Growth</h2>

      <div className='space-y-4'>
        {Object.entries(result.all_predictions as Record<string, number>).map(([sector, value]) => (
          <div
            key={sector}
            className='bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl p-4 flex justify-between items-center'
          >
            <span className='text-white capitalize'>{sector.replace(/_/g, " ")}</span>
            <div className='flex items-center'>
              {value >= 0 ? (
                <FiArrowUp className='text-green-400 mr-2' />
              ) : (
                <FiArrowDown className='text-red-400 mr-2' />
              )}
              <span className={`font-medium ${value >= 0 ? "text-green-400" : "text-red-400"}`}>
                {value > 0 ? "+" : ""}
                {value.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorGrowth;
