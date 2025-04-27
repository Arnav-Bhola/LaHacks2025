"use client";

import { parseFormattedText } from "@/app/utils/textUtils";
import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

interface QuickSendProps {
  onSend: (message: string) => void;
  className?: string;
}

const QuickSend: React.FC<QuickSendProps> = ({ onSend, className }) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(""); // State to store the response from the backend
  const [loading, setLoading] = useState(false); // State to handle loading

  const handleSend = async () => {
    if (message.trim()) {
      setLoading(true); // Set loading to true while waiting for the response
      try {
        const res = await fetch("http://localhost:5000/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: message }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch response from the backend");
        }

        const data = await res.json();
        setResponse(data.result); // Set the response from the backend
      } catch (error) {
        console.error("Error fetching chatbot response:", error);
        setResponse("An error occurred while fetching the response.");
      } finally {
        setLoading(false); // Set loading to false after the response is received
      }

      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className={`w-full bottom-4 ${className} mt-10`}>
      <div className='relative'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Ask a question with provided context...'
          className='w-full p-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg'
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
          aria-label='Send message'
        >
          <FiSend className='w-5 h-5' />
        </button>
      </div>
      {loading ? (
        <p className='mt-4 text-gray-500'>Loading...</p>
      ) : (
        response && (
          <div
            title='Chatbot response'
            className='w-full mt-4 p-4 rounded-lg bg-blue-100 dark:bg-gray-800 border border-blue-300 dark:border-blue-600 text-gray-800 dark:text-gray-100 shadow-lg'
          >
            {parseFormattedText(response)}
          </div>
        )
      )}
    </div>
  );
};

export default QuickSend;
