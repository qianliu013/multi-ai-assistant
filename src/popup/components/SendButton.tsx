import React, { useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
}) => {
  // 监听自定义发送事件（来自MessageInput的Ctrl+Enter）
  useEffect(() => {
    const handleSendEvent = () => {
      if (!disabled && !isLoading) {
        onClick();
      }
    };

    document.addEventListener('sendMessage', handleSendEvent);
    return () => document.removeEventListener('sendMessage', handleSendEvent);
  }, [onClick, disabled, isLoading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg
        font-medium text-white transition-all duration-200
        ${
          disabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg active:scale-[0.98]'
        }
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          发送中...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          发送消息
        </>
      )}
    </button>
  );
};
