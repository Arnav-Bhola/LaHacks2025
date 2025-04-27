"use client";

import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

const AutoPortfolio: React.FC = () => {
  const [prompt, setPrompt] = useState(""); // State to save the prompt

  const handleGeneratePortfolio = () => {
    console.log(prompt); // Log the entered prompt
  };

  return (
    <div className='w-full mt-6'>
      <p className='text-gray-700 dark:text-gray-300 mb-4 text-center'>
        Don&apos;t know where to start? Let us generate a portfolio for you!
      </p>
      <div className='relative'>
        <input
          type='text'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Enter a prompt to generate a portfolio...'
          className='w-full p-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg'
          onKeyPress={(e) => e.key === "Enter" && handleGeneratePortfolio()}
        />
        <button
          onClick={handleGeneratePortfolio}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
          aria-label='Generate portfolio'
        >
          <FiSend className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
};

export default AutoPortfolio;
