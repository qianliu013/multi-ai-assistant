import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class GeminiAdapter extends BaseAdapter {
  constructor() {
    super('Gemini', {
      inputBox: 'rich-textarea textarea, textarea[aria-label*="Enter a prompt"]',
      sendButton: 'button[aria-label="Send message"], button[aria-label="Send"]',
      newChatButton: '[data-test-id="new-conversation-button"], button:contains("New chat")',
    });
  }

  async sendMessage(message: string, conversationMode: ConversationMode): Promise<ContentResponse> {
    try {
      console.log(`Gemini: 准备发送消息`, { message, conversationMode });

      if (conversationMode === 'new') {
        await this.startNewConversation();
      }

      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('Gemini: 找到输入框');

      // 清空现有内容并输入消息
      await this.clearAndInputMessage(inputBox as HTMLElement, message);

      console.log('Gemini: 消息输入完成');
      await delay(500);

      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('Gemini: 找到发送按钮');

      await this.simulateClick(sendButton as HTMLElement);
      console.log('Gemini: 消息发送完成');

      return { success: true };
    } catch (error) {
      console.error('Gemini 发送消息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async clearAndInputMessage(element: HTMLElement, message: string): Promise<void> {
    if (element instanceof HTMLTextAreaElement) {
      // Gemini通常使用textarea
      element.value = '';
      element.focus();
      await this.simulateTyping(element, message);
    } else {
      // 备用方案：直接设置值
      element.textContent = '';
      element.focus();
      
      // 对于rich-textarea，可能需要特殊处理
      if (element.closest('rich-textarea')) {
        // 尝试找到内部的textarea
        const textarea = element.closest('rich-textarea')?.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = '';
          await this.simulateTyping(textarea, message);
          return;
        }
      }
      
      await this.simulateTyping(element, message);
    }
  }

  protected async startNewConversation(): Promise<void> {
    try {
      // Gemini特定的新对话逻辑
      const newChatSelectors = [
        '[data-test-id="new-conversation-button"]',
        'button:contains("New chat")',
        '[aria-label="New conversation"]',
        'button[aria-label="Start new conversation"]'
      ];

      for (const selector of newChatSelectors) {
        const newChatButton = document.querySelector(selector) as HTMLElement;
        if (newChatButton) {
          await this.simulateClick(newChatButton);
          await delay(1000);
          console.log('Gemini: 成功开始新对话');
          return;
        }
      }

      console.log('Gemini: 未找到新对话按钮，继续使用当前对话');
    } catch (error) {
      console.log('Gemini: 无法开始新对话，继续使用当前对话');
    }
  }
}