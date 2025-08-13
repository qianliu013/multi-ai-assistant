import type {
  AIProvider,
  ConversationMode,
  AITabStatus,
  SendMessageRequest,
  CheckTabsRequest,
  MessageResponse,
  ContentMessage,
} from '@/shared/types';
import { handleError, delay } from '@/shared/utils';
import { AI_URLS } from '@/shared/types';

class BackgroundManager {
  private aiUrls: Record<AIProvider, string> = AI_URLS;

  constructor() {
    this.init();
  }

  private init(): void {
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener(
      (
        message: SendMessageRequest | CheckTabsRequest,
        sender,
        sendResponse
      ) => {
        void this.handleMessage(message, sender, sendResponse);
        return true; // 保持消息通道开放以支持异步响应
      }
    );

    // 监听扩展安装事件
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Multi-AI Assistant 扩展已安装');
    });
  }

  private async handleMessage(
    message: SendMessageRequest | CheckTabsRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      switch (message.action) {
        case 'checkAITabs': {
          const tabStatus = await this.checkAITabs();
          sendResponse({ success: true, tabStatus });
          break;
        }

        case 'sendToAIs': {
          const result = await this.sendToAIs(message);
          sendResponse(result);
          break;
        }

        default:
          sendResponse({ success: false, error: '未知的操作类型' });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'handling message');
      console.error('处理消息时出错:', error);
      sendResponse({ success: false, error: errorMessage });
    }
  }

  private async checkAITabs(): Promise<AITabStatus> {
    try {
      const tabs = await chrome.tabs.query({});
      const tabStatus: AITabStatus = {
        chatgpt: false,
        claude: false,
        gemini: false,
      };

      // 检查每个AI网站是否已经打开
      Object.entries(this.aiUrls).forEach(([ai, url]) => {
        tabStatus[ai as AIProvider] = tabs.some(tab =>
          tab.url?.startsWith(url)
        );
      });

      return tabStatus;
    } catch (error) {
      console.error('检查AI tabs时出错:', error);
      return {
        chatgpt: false,
        claude: false,
        gemini: false,
      };
    }
  }

  private async sendToAIs({
    message,
    selectedAIs,
    conversationMode,
  }: SendMessageRequest): Promise<MessageResponse> {
    try {
      console.log('开始发送消息到AIs:', {
        message,
        selectedAIs,
        conversationMode,
      });

      // 并行处理所有选中的AI
      const sendPromises = selectedAIs.map(ai =>
        this.sendToSingleAI(ai, message, conversationMode)
      );

      // 等待所有发送完成（不管成功或失败）
      await Promise.allSettled(sendPromises);

      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error, 'sending to AIs');
      console.error('发送到AIs时出错:', error);
      return { success: false, error: errorMessage };
    }
  }

  private async sendToSingleAI(
    ai: AIProvider,
    message: string,
    conversationMode: ConversationMode
  ): Promise<void> {
    try {
      console.log(`开始发送到 ${ai}:`, { message, conversationMode });

      // 查找或创建AI tab
      const tab = await this.findOrCreateAITab(ai, conversationMode);

      if (!tab) {
        throw new Error(`无法创建或找到 ${ai} 的标签页`);
      }

      // 等待tab加载完成
      await this.waitForTabLoad(tab.id!);

      // 向content script发送消息
      const contentMessage: ContentMessage = {
        action: 'sendMessage',
        message,
        conversationMode,
      };

      await chrome.tabs.sendMessage(tab.id!, contentMessage);

      // 通知popup发送成功
      this.notifyPopup(ai, true);

      console.log(`${ai} 发送成功`);
    } catch (error) {
      const errorMessage = handleError(error, `sending to ${ai}`);
      console.error(`发送到 ${ai} 时出错:`, error);

      // 通知popup发送失败
      this.notifyPopup(ai, false, errorMessage);

      throw error;
    }
  }

  private async findOrCreateAITab(
    ai: AIProvider,
    conversationMode: ConversationMode
  ): Promise<chrome.tabs.Tab | null> {
    try {
      const aiUrl = this.aiUrls[ai];
      if (!aiUrl) {
        throw new Error(`未知的AI类型: ${ai}`);
      }

      // 查找现有的AI tab
      const tabs = await chrome.tabs.query({});
      const existingTab = tabs.find(tab => tab.url?.startsWith(aiUrl));

      // 如果需要新对话且找到了现有tab，重新加载到首页
      if (existingTab && conversationMode === 'new') {
        await chrome.tabs.update(existingTab.id!, { url: aiUrl });
        return existingTab;
      }

      // 如果找到现有tab且是继续对话模式，直接使用
      if (existingTab && conversationMode === 'continue') {
        await chrome.tabs.update(existingTab.id!, { active: true });
        return existingTab;
      }

      // 创建新tab
      const newTab = await chrome.tabs.create({
        url: aiUrl,
        active: true, // 不要自动切换到新tab
      });

      return newTab;
    } catch (error) {
      console.error(`查找或创建 ${ai} tab时出错:`, error);
      throw error;
    }
  }

  private async waitForTabLoad(tabId: number, timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Tab加载超时'));
      }, timeout);

      const checkTab = async (): Promise<void> => {
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.status === 'complete') {
            clearTimeout(timeoutId);
            // 额外等待一点时间确保页面完全加载
            await delay(1000);
            resolve();
          } else {
            setTimeout(() => void checkTab(), 500);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      void checkTab();
    });
  }

  private notifyPopup(ai: AIProvider, success: boolean, error?: string): void {
    try {
      void chrome.runtime.sendMessage({
        action: 'sendResult',
        ai,
        success,
        error,
      });
    } catch (error) {
      console.error('通知popup时出错:', error);
    }
  }
}

// 初始化后台管理器
new BackgroundManager();
