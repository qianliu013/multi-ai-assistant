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
      label: '继续现有对话',
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
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">对话模式</h3>
      
      <div className="space-y-2">
        {modes.map(modeOption => (
          <label
            key={modeOption.value}
            className={`
              flex items-center gap-3 p-3 rounded-lg border cursor-pointer
              transition-all duration-200
              ${
                mode === modeOption.value
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="radio"
              name="conversation-mode"
              value={modeOption.value}
              checked={mode === modeOption.value}
              onChange={e => onModeChange(e.target.value as ConversationModeType)}
              disabled={disabled}
              className="sr-only"
            />
            
            <div className={`
              w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${
                mode === modeOption.value
                  ? 'border-primary-600 bg-primary-600'
                  : 'border-gray-300'
              }
            `}>
              {mode === modeOption.value && (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>

            <div className={`
              flex items-center gap-2 text-primary-600
              ${mode === modeOption.value ? 'text-primary-700' : 'text-gray-400'}
            `}>
              {modeOption.icon}
            </div>

            <div className="flex-1">
              <div className={`
                font-medium text-sm
                ${mode === modeOption.value ? 'text-gray-900' : 'text-gray-700'}
              `}>
                {modeOption.label}
              </div>
              <div className="text-xs text-gray-500">
                {modeOption.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};