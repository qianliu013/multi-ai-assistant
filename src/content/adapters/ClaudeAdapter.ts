import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super('Claude', {
      inputBox:
        'div[contenteditable="true"], textarea[placeholder*="Talk to Claude"]',
      sendButton: 'button[aria-label="Send Message"], button:contains("Send")',
      newChatButton:
        'button:contains("Start new conversation"), a[href="/chat"]',
    });
  }

  async sendMessage(
    message: string,
    conversationMode: ConversationMode
  ): Promise<ContentResponse> {
    try {
      console.log(`Claude: 准备发送消息`, { message, conversationMode });

      if (conversationMode === 'new') {
        await this.startNewConversation();
      }

      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('Claude: 找到输入框');

      // 清空现有内容并输入消息
      await this.clearAndInputMessage(inputBox as HTMLElement, message);

      console.log('Claude: 消息输入完成');
      await delay(500);

      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('Claude: 找到发送按钮');

      await this.simulateClick(sendButton as HTMLElement);
      console.log('Claude: 消息发送完成');

      return { success: true };
    } catch (error) {
      console.error('Claude 发送消息失败:', error);
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
      await this.simulateTyping(element, message);
    } else {
      // 对于contenteditable元素
      element.textContent = '';
      element.innerHTML = '';
      element.focus();

      // Claude使用contenteditable，需要特殊处理
      // 直接设置innerHTML可能更可靠
      element.innerHTML = message.replace(/\n/g, '<br>');

      // 触发必要的事件
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('keyup', { bubbles: true }));

      // 设置光标到末尾
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  protected async startNewConversation(): Promise<void> {
    try {
      // Claude特定的新对话逻辑
      const newChatSelectors = [
        'button:contains("Start new conversation")',
        'a[href="/chat"]',
        '[data-testid="new-chat-button"]',
        'button[aria-label="New conversation"]',
      ];

      for (const selector of newChatSelectors) {
        const newChatButton = document.querySelector(selector) as HTMLElement;
        if (newChatButton) {
          await this.simulateClick(newChatButton);
          await delay(1000);
          console.log('Claude: 成功开始新对话');
          return;
        }
      }

      console.log('Claude: 未找到新对话按钮，继续使用当前对话');
    } catch (error) {
      console.log('Claude: 无法开始新对话，继续使用当前对话');
    }
  }
}
