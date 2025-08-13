import type {
  AIAdapter,
  ContentMessage,
  ContentResponse,
} from '@/shared/types';
import { getAIProviderFromURL, handleError } from '@/shared/utils';
import { ChatGPTAdapter } from './adapters/ChatGPTAdapter';
import { ClaudeAdapter } from './adapters/ClaudeAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';

class ContentManager {
  private adapter: AIAdapter | null = null;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // 创建对应的AI适配器
      this.adapter = this.createAdapter();

      if (this.adapter) {
        console.log(`初始化 ${this.adapter.name} 适配器`);
        await this.adapter.initialize();
        this.initialized = true;

        // 监听来自background的消息
        chrome.runtime.onMessage.addListener(
          (message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // 保持消息通道开放
          }
        );

        console.log(`${this.adapter.name} 内容脚本初始化完成`);
      } else {
        console.log('当前页面不是支持的AI网站');
      }
    } catch (error) {
      console.error('内容脚本初始化失败:', error);
    }
  }

  private createAdapter(): AIAdapter | null {
    const currentUrl = window.location.href;
    const aiProvider = getAIProviderFromURL(currentUrl);

    switch (aiProvider) {
      case 'chatgpt':
        return new ChatGPTAdapter();
      case 'claude':
        return new ClaudeAdapter();
      case 'gemini':
        return new GeminiAdapter();
      default:
        return null;
    }
  }

  private async handleMessage(
    message: ContentMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ContentResponse) => void
  ): Promise<void> {
    try {
      if (!this.initialized || !this.adapter) {
        throw new Error('适配器未初始化');
      }

      switch (message.action) {
        case 'sendMessage': {
          const result = await this.adapter.sendMessage(
            message.message,
            message.conversationMode
          );
          sendResponse(result);
          break;
        }

        default:
          sendResponse({
            success: false,
            error: '未知的操作类型',
          });
      }
    } catch (error) {
      const errorMessage = handleError(error, 'handling content message');
      console.error('处理消息时出错:', error);
      sendResponse({
        success: false,
        error: errorMessage,
      });
    }
  }
}

// 初始化内容管理器
new ContentManager();
