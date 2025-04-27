import React from "react";

type TickerInputProps = {
  id: number;
  ticker: string;
  quantity: string;
  onTickerChange: (id: number, value: string) => void;
  onQuantityChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  isLast: boolean;
  onAddMore: () => void;
};

const TickerInput: React.FC<TickerInputProps> = ({
  id,
  ticker,
  quantity,
  onTickerChange,
  onQuantityChange,
  onRemove,
  isLast,
  onAddMore,
}) => {
  // Sample tickers for the dropdown - you can replace with your own data source
  const popularTickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX"];

  return (
    <div className='flex items-center gap-4 mb-4'>
      <div className='flex-1'>
        <label
          htmlFor={`ticker-${id}`}
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
        >
          Ticker
        </label>
        <select
          id={`ticker-${id}`}
          value={ticker}
          onChange={(e) => onTickerChange(id, e.target.value)}
          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        >
          <option value=''>Select a ticker</option>
          {popularTickers.map((ticker) => (
            <option
              key={ticker}
              value={ticker}
            >
              {ticker}
            </option>
          ))}
        </select>
      </div>

      <div className='flex-1'>
        <label
          htmlFor={`quantity-${id}`}
          className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
        >
          Quantity
        </label>
        <input
          id={`quantity-${id}`}
          type='number'
          value={quantity}
          onChange={(e) => onQuantityChange(id, e.target.value)}
          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          placeholder='0'
        />
      </div>

      <div className='flex items-center gap-2 h-full self-end'>
        {id > 0 && (
          <button
            type='button'
            onClick={() => onRemove(id)}
            className='px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors h-[42px]'
          >
            Remove
          </button>
        )}
        {isLast && (
          <button
            type='button'
            onClick={onAddMore}
            className='px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors h-[42px]'
          >
            Add +
          </button>
        )}
      </div>
    </div>
  );
};

export default TickerInput;
