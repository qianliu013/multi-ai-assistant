import React from 'react';
import { MessageInput } from './components/MessageInput';
import { AISelector } from './components/AISelector';
import { ConversationMode } from './components/ConversationMode';
import { SendButton } from './components/SendButton';
import { StatusMessages } from './components/StatusMessages';
import { Header } from './components/Header';
import { usePopupState } from './hooks/usePopupState';

const App: React.FC = () => {
  const {
    message,
    setMessage,
    selectedAIs,
    setSelectedAIs,
    conversationMode,
    setConversationMode,
    aiStatus,
    isLoading,
    statusMessages,
    handleSend,
    clearStatusMessages,
  } = usePopupState();

  return (
    <div className="w-full min-h-[480px] bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 space-y-4">
        <MessageInput
          value={message}
          onChange={setMessage}
          disabled={isLoading}
        />
        
        <AISelector
          selectedAIs={selectedAIs}
          onSelectionChange={setSelectedAIs}
          aiStatus={aiStatus}
        />
        
        <ConversationMode
          mode={conversationMode}
          onModeChange={setConversationMode}
          disabled={isLoading}
        />
        
        <SendButton
          onClick={handleSend}
          disabled={isLoading || !message.trim() || selectedAIs.length === 0}
          isLoading={isLoading}
        />
        
        <StatusMessages
          messages={statusMessages}
          onClear={clearStatusMessages}
        />
      </main>
    </div>
  );
};

export default App;