import { useState, useEffect, useCallback } from 'react';
import type { 
  AIProvider, 
  ConversationMode, 
  AITabStatus, 
  PopupSettings,
  SendMessageRequest,
  CheckTabsRequest,
  SendResultMessage
} from '@/shared/types';
import { storage, handleError } from '@/shared/utils';

interface StatusMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
}

export const usePopupState = () => {
  const [message, setMessage] = useState('');
  const [selectedAIs, setSelectedAIs] = useState<AIProvider[]>(['chatgpt', 'claude', 'gemini']);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('continue');
  const [aiStatus, setAiStatus] = useState<AITabStatus>({
    chatgpt: false,
    claude: false,
    gemini: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

  // 加载保存的设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storage.get<PopupSettings>('popupSettings', {
          selectedAIs: ['chatgpt', 'claude', 'gemini'],
          conversationMode: 'continue',
        });
        
        setSelectedAIs(settings.selectedAIs);
        setConversationMode(settings.conversationMode);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // 保存设置
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings: PopupSettings = {
          selectedAIs,
          conversationMode,
        };
        await storage.set('popupSettings', settings);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [selectedAIs, conversationMode]);

  // 检查AI标签页状态
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const request: CheckTabsRequest = { action: 'checkAITabs' };
        const response = await chrome.runtime.sendMessage(request);
        
        if (response?.tabStatus) {
          setAiStatus(response.tabStatus);
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
        // 设置默认状态
        setAiStatus({
          chatgpt: false,
          claude: false,
          gemini: false,
        });
      }
    };

    checkAIStatus();
  }, []);

  // 监听发送结果消息
  useEffect(() => {
    const handleMessage = (message: SendResultMessage) => {
      if (message.action === 'sendResult') {
        const { ai, success, error } = message;
        addStatusMessage(
          success ? `✓ ${ai} 发送成功` : `✗ ${ai} 发送失败: ${error}`,
          success ? 'success' : 'error'
        );
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const addStatusMessage = useCallback((text: string, type: StatusMessage['type']) => {
    const newMessage: StatusMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: Date.now(),
    };

    setStatusMessages(prev => [...prev, newMessage]);

    // 5秒后自动移除消息
    setTimeout(() => {
      setStatusMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 5000);
  }, []);

  const clearStatusMessages = useCallback(() => {
    setStatusMessages([]);
  }, []);

  const handleSend = useCallback(async () => {
    if (!message.trim() || selectedAIs.length === 0) {
      addStatusMessage('请输入消息并选择至少一个AI', 'error');
      return;
    }

    setIsLoading(true);
    clearStatusMessages();

    try {
      const request: SendMessageRequest = {
        action: 'sendToAIs',
        message: message.trim(),
        selectedAIs,
        conversationMode,
      };

      const response = await chrome.runtime.sendMessage(request);

      if (response?.success) {
        addStatusMessage(`正在向 ${selectedAIs.join(', ')} 发送消息...`, 'info');
        setMessage(''); // 清空输入框
      } else {
        addStatusMessage(response?.error || '发送失败', 'error');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'sending message');
      addStatusMessage(`发送失败: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [message, selectedAIs, conversationMode, addStatusMessage, clearStatusMessages]);

  return {
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
    addStatusMessage,
  };
};