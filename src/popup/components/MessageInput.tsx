import React, { useCallback } from 'react';
import { formatCharCount } from '@/shared/utils';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const charCount = formatCharCount(value.length);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        // 触发发送 - 这个需要在父组件处理
        const sendEvent = new CustomEvent('sendMessage');
        document.dispatchEvent(sendEvent);
      }
    },
    []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="message-input"
          className="text-sm font-semibold text-gray-800"
        >
          输入消息
        </label>
        <div className={`text-xs ${charCount.color}`}>
          {charCount.text}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          id="message-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="在此输入要发送给AI的消息... (Ctrl+Enter发送)"
          rows={4}
          className={`
            w-full p-3 border border-gray-200 rounded-xl resize-none shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-300'}
          `}
          maxLength={4000}
        />
      </div>
      
      {value.length > 3000 && (
        <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
          <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
          消息较长，某些AI可能有字数限制
        </p>
      )}
    </div>
  );
};
