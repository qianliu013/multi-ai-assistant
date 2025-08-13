import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface StatusMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
}

interface StatusMessagesProps {
  messages: StatusMessage[];
  onClear: () => void;
}

const MessageIcon: React.FC<{ type: StatusMessage['type'] }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const MessageStyles: Record<StatusMessage['type'], string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  messages,
  onClear,
}) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">状态消息</h4>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            清除
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-32 overflow-y-auto">
        {messages.map(message => (
          <div
            key={message.id}
            className={`
              flex items-start gap-2 p-2 rounded border text-xs
              ${MessageStyles[message.type]}
              animate-in slide-in-from-top-2 duration-300
            `}
          >
            <MessageIcon type={message.type} />
            <span className="flex-1 leading-relaxed">{message.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};