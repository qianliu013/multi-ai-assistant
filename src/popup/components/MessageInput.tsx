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
    <div className="space-y-2">
      <label
        htmlFor="message-input"
        className="block text-sm font-medium text-gray-700"
      >
        输入消息
      </label>
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
            w-full p-3 border border-gray-300 rounded-lg resize-none
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-colors duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          maxLength={4000}
        />
        <div className={`absolute bottom-2 right-3 text-xs ${charCount.color}`}>
          {charCount.text}
        </div>
      </div>
      {value.length > 3000 && (
        <p className="text-xs text-orange-600 flex items-center gap-1">
          <span>⚠️</span>
          消息较长，某些AI可能有字数限制
        </p>
      )}
    </div>
  );
};
