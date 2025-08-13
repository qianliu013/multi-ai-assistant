import React from 'react';
import { Bot } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Multi-AI Assistant</h1>
          <p className="text-xs text-primary-100">同时向多个AI发送消息</p>
        </div>
      </div>
    </header>
  );
};