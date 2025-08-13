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
    <div className="w-full bg-white flex flex-col">
      <Header />
      
      <main className="p-3">
        <div className="space-y-3">
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

          <div className="space-y-2">
            <MessageInput
              value={message}
              onChange={setMessage}
              disabled={isLoading}
            />
            
            <SendButton
              onClick={() => void handleSend()}
              disabled={isLoading || !message.trim() || selectedAIs.length === 0}
              isLoading={isLoading}
            />
          </div>
          
          <StatusMessages
            messages={statusMessages}
            onClear={clearStatusMessages}
          />
        </div>
      </main>
    </div>
  );
};

export default App;