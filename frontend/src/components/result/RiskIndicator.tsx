import React from "react";

type RiskIndicatorProps = {
  riskLevel: string;
};

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ riskLevel }) => {
  return (
    <div className='w-full bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-lg flex flex-row items-center justify-between'>
      <div className='flex-col justify-between items-center'>
        <h3 className='text-xl font-semibold text-white'>Portfolio Risk Assessment</h3>

        <p className='text-blue-100 mt-2'>
          {riskLevel === "High"
            ? "Your portfolio contains several securities with negative growth potential. Consider rebalancing."
            : "Your portfolio is well-diversified with mostly positive growth assets."}
        </p>
      </div>
      <div
        className={`px-6 py-2 h-[fit-content] rounded-full font-bold ${
          riskLevel === "High" ? "bg-red-500/80" : "bg-green-500/80"
        }`}
      >
        {riskLevel} Risk
      </div>
    </div>
  );
};

export default RiskIndicator;
