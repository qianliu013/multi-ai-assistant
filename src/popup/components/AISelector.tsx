import React from 'react';
import type { AIProvider, AITabStatus } from '@/shared/types';
import { AI_DISPLAY_NAMES } from '@/shared/types';

interface AISelectorProps {
  selectedAIs: AIProvider[];
  onSelectionChange: (selectedAIs: AIProvider[]) => void;
  aiStatus: AITabStatus;
}


export const AISelector: React.FC<AISelectorProps> = ({
  selectedAIs,
  onSelectionChange,
  aiStatus,
}) => {
  const handleAIToggle = (ai: AIProvider) => {
    if (selectedAIs.includes(ai)) {
      onSelectionChange(selectedAIs.filter(selected => selected !== ai));
    } else {
      onSelectionChange([...selectedAIs, ai]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(['chatgpt', 'claude', 'gemini']);
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">选择 AI</span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            全选
          </button>
          <span className="text-gray-300">·</span>
          <button
            onClick={handleSelectNone}
            className="text-xs text-gray-500 hover:text-gray-600 font-medium"
          >
            全不选
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['chatgpt', 'claude', 'gemini'] as AIProvider[]).map(ai => {
          const isSelected = selectedAIs.includes(ai);
          const isOnline = aiStatus[ai];

          return (
            <button
              key={ai}
              onClick={() => handleAIToggle(ai)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border shadow-sm hover:shadow-md
                ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 text-gray-500 border-gray-300 hover:border-gray-400 hover:bg-gray-200'
                }
              `}
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-800' : 'text-gray-500'}`}>
                {AI_DISPLAY_NAMES[ai]}
              </span>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-gray-400'
                } ${isSelected ? 'bg-opacity-80' : ''}`}
                title={isOnline ? '在线' : '离线'}
              />
            </button>
          );
        })}
      </div>

      {selectedAIs.length === 0 && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          请至少选择一个 AI
        </p>
      )}
    </div>
  );
};
