import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super('Claude', { sendButton: 'button[aria-label="Send message"]' });
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

      await this.setInputValue('div[contenteditable="true"]', message);
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

  protected async startNewConversation(): Promise<void> {
    const slideBar = await this.waitForElement<HTMLButtonElement>(
      'button[aria-label="Sidebar"]'
    );
    let newChatButton = document.querySelector<HTMLButtonElement>(
      'a[aria-label="New chat"]'
    );
    if (!newChatButton) {
      await this.simulateClick(slideBar);
      await delay(500);
    }
    newChatButton = await this.waitForElement<HTMLButtonElement>(
      'a[aria-label="New chat"]'
    );
    if (!newChatButton) {
      throw new Error('错误：无法找到发起新对话按钮。');
    }
    await this.simulateClick(newChatButton);
    await delay(1000);
  }
}
