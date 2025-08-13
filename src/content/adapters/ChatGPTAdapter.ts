import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super('ChatGPT', {
      inputBox:
        'textarea[placeholder*="Message"], #prompt-textarea, textarea[data-testid="textbox"]',
      sendButton:
        'button[data-testid="send-button"], button[aria-label="Send prompt"]',
      newChatButton: 'a[href="/"], button:contains("New chat")',
      messageContainer: '[data-testid="conversation-turn"]',
    });
  }

  async sendMessage(
    message: string,
    conversationMode: ConversationMode
  ): Promise<ContentResponse> {
    try {
      console.log(`ChatGPT: 准备发送消息`, { message, conversationMode });

      // 如果是新对话模式，尝试点击新对话按钮
      if (conversationMode === 'new') {
        await this.startNewConversation();
      }

      // 等待输入框出现
      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('ChatGPT: 找到输入框');

      // 清空现有内容并输入消息
      await this.clearAndInputMessage(inputBox as HTMLElement, message);

      console.log('ChatGPT: 消息输入完成');

      // 等待一小段时间让输入生效
      await delay(500);

      // 查找并点击发送按钮
      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('ChatGPT: 找到发送按钮');

      await this.simulateClick(sendButton as HTMLElement);
      console.log('ChatGPT: 消息发送完成');

      return { success: true };
    } catch (error) {
      console.error('ChatGPT 发送消息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async clearAndInputMessage(
    element: HTMLElement,
    message: string
  ): Promise<void> {
    if (element instanceof HTMLTextAreaElement) {
      // 对于textarea元素
      element.value = '';
      element.focus();
      await this.simulateTyping(element, message);
    } else {
      // 对于contenteditable元素
      element.textContent = '';
      element.innerHTML = '';
      element.focus();

      // 使用富文本编辑器的方式输入
      element.textContent = message;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('keyup', { bubbles: true }));
    }
  }

  protected async startNewConversation(): Promise<void> {
    try {
      // ChatGPT特定的新对话逻辑
      const newChatSelectors = [
        'a[href="/"]',
        'button:contains("New chat")',
        '[data-testid="new-chat-button"]',
        'nav a[href="/"]',
      ];

      for (const selector of newChatSelectors) {
        const newChatButton = document.querySelector(selector) as HTMLElement;
        if (newChatButton) {
          await this.simulateClick(newChatButton);
          await delay(1000);
          console.log('ChatGPT: 成功开始新对话');
          return;
        }
      }

      console.log('ChatGPT: 未找到新对话按钮，继续使用当前对话');
    } catch (error) {
      console.log('ChatGPT: 无法开始新对话，继续使用当前对话');
    }
  }
}
