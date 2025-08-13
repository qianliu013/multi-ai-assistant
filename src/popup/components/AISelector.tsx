import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { AIProvider, AITabStatus } from '@/shared/types';
import { AI_DISPLAY_NAMES } from '@/shared/types';

interface AISelectorProps {
  selectedAIs: AIProvider[];
  onSelectionChange: (selectedAIs: AIProvider[]) => void;
  aiStatus: AITabStatus;
}

const AI_COLORS: Record<AIProvider, string> = {
  chatgpt: 'text-ai-chatgpt',
  claude: 'text-ai-claude',
  gemini: 'text-ai-gemini',
};

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">选择AI</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            全选
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleSelectNone}
            className="text-xs text-gray-500 hover:text-gray-600 font-medium"
          >
            全不选
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(['chatgpt', 'claude', 'gemini'] as AIProvider[]).map(ai => {
          const isSelected = selectedAIs.includes(ai);
          const isOnline = aiStatus[ai];

          return (
            <div
              key={ai}
              onClick={() => handleAIToggle(ai)}
              className={`
                flex items-center justify-between p-3 rounded-lg border cursor-pointer
                transition-all duration-200 hover:shadow-sm
                ${
                  isSelected
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-primary-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className={`font-medium ${AI_COLORS[ai]}`}>
                  {AI_DISPLAY_NAMES[ai]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                  title={isOnline ? '已打开' : '需要打开新标签页'}
                />
                <span className="text-xs text-gray-500">
                  {isOnline ? '在线' : '离线'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAIs.length === 0 && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
          请至少选择一个AI
        </p>
      )}
    </div>
  );
};
