import React from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import type { ConversationMode as ConversationModeType } from '@/shared/types';

interface ConversationModeProps {
  mode: ConversationModeType;
  onModeChange: (mode: ConversationModeType) => void;
  disabled?: boolean;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  const modes: Array<{
    value: ConversationModeType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      value: 'continue',
      label: '继续对话',
      description: '在当前对话中继续',
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      value: 'new',
      label: '新建对话',
      description: '开始新的对话',
      icon: <Plus className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">对话模式</span>
      </div>
      
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {modes.map(modeOption => (
          <button
            key={modeOption.value}
            onClick={() => onModeChange(modeOption.value)}
            disabled={disabled}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 border
              ${
                mode === modeOption.value
                  ? 'bg-blue-500 text-white shadow-sm border-blue-500'
                  : 'bg-transparent text-gray-600 hover:text-gray-800 border-transparent hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={modeOption.description}
          >
            <div
              className={`
                flex items-center
                ${mode === modeOption.value ? 'text-white' : 'text-gray-400'}
              `}
            >
              {React.cloneElement(modeOption.icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
            </div>
            <span className="text-xs font-medium">{modeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
