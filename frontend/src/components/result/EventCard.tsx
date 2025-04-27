import { parseFormattedText } from "@/app/utils/textUtils";
import React, { useState } from "react";
import { FiCopy, FiDownload, FiCheck } from "react-icons/fi"; // Import icons

const url = "https://api.asi1.ai/v1/chat/completions";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: "Bearer sk_ae9b780415204cf6be1528f8007a9cc83c2bdebf1784464abbd023951727a41e",
};

type EventCardProps = {
  event: { id: number; event: string; impact: string };
  portfolio: { ticker: string; quantity: string }[];
  sectorPredictions: Record<string, number>;
};

const EventCard: React.FC<EventCardProps> = ({ event, portfolio, sectorPredictions }) => {
  const [explanation, setExplanation] = useState<string>(""); // State to store the explanation
  const [loading, setLoading] = useState<boolean>(false); // State to show loading indicator
  const [copyIcon, setCopyIcon] = useState(<FiCopy size={18} />);

  const copyToClipboard = () => {
    if (explanation) {
      navigator.clipboard.writeText(explanation).then(() => {
        setCopyIcon(<FiCheck size={18} />);
        setTimeout(() => {
          setCopyIcon(<FiCopy size={18} />);
        }, 2000);
      });
    }
  };

  const downloadAsTextFile = () => {
    if (explanation) {
      const blob = new Blob([explanation], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "explanation.txt";
      link.click();
    }
  };

  const handleExplainClick = async () => {
    if (explanation) {
      // Reset the explanation if it already exists
      setExplanation("");
      return;
    }

    try {
      setLoading(true);
      setExplanation(""); // Clear previous explanation

      // Create a detailed prompt for the AI
      const portfolioSummary = portfolio
        .map((entry) => `${entry.ticker} (${entry.quantity} shares)`)
        .join(", ");
      const sectorSummary = Object.entries(sectorPredictions)
        .map(([sector, prediction]) => `${sector}: ${prediction.toFixed(2)}%`)
        .join(", ");

      const prompt = `
        Explain how the event "${event.event}" might impact the portfolio and the sectors. 
        The portfolio contains the following assets: ${portfolioSummary}. 
        The sector predictions are as follows: ${sectorSummary}.
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
        throw new Error("Failed to fetch explanation");
      }

      const data = await response.json(); // Parse the entire response as JSON
      const reasoning = data.choices?.[0]?.message?.content; // Extract the explanation content

      if (reasoning) {
        const reasoningWithoutFirstLine = reasoning.split("\n").slice(2).join("\n");
        setExplanation(reasoningWithoutFirstLine); // Set the explanation
      } else {
        setExplanation("No explanation available.");
      }
    } catch (error) {
      console.error("Error making API request:", error);
      setExplanation("Failed to fetch explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl p-4'>
      <div className='flex justify-between items-center'>
        <div className='flex-1'>
          <p className='text-white'>{event.event}</p>
        </div>
        <button
          onClick={handleExplainClick}
          className='bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg ml-4 transition-colors'
        >
          {explanation ? "Clear Response" : "Explain why"}
        </button>
      </div>

      {/* Display the explanation */}
      {loading && <p className='text-blue-300 mt-4'>Fetching explanation...</p>}
      {explanation && (
        <div className='relative mt-4 bg-gray-700/50 backdrop-blur-md rounded-xl p-4'>
          {/* Floating icons */}
          <div className='absolute top-2 right-2 flex space-x-2'>
            <button
              onClick={copyToClipboard}
              className='bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg transition-colors'
              title='Copy Response'
            >
              {copyIcon}
            </button>
            <button
              onClick={downloadAsTextFile}
              className='bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg transition-colors'
              title='Download as Text'
            >
              <FiDownload size={18} />
            </button>
          </div>

          <h3 className='text-xl font-bold text-white mb-2'>Explanation:</h3>
          <div className='text-gray-300 leading-7'>
            {parseFormattedText(explanation)}
            <br />
            <br /> If you would like to continue this conversation, please use the financial agent
            chatbot.
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
