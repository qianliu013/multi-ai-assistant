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
        w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
        font-semibold text-white transition-all duration-200 shadow-md
        ${
          disabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed shadow-sm'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-lg active:scale-[0.98]'
        }
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">发送中...</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span className="text-sm">发送消息</span>
        </>
      )}
    </button>
  );
};
