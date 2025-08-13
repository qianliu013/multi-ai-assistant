import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class GeminiAdapter extends BaseAdapter {
  constructor() {
    super('Gemini', { sendButton: 'button.send-button' });
  }

  async sendMessage(
    message: string,
    conversationMode: ConversationMode
  ): Promise<ContentResponse> {
    try {
      console.log(`Gemini: 准备发送消息`, { message, conversationMode });

      if (conversationMode === 'new') {
        await this.startNewConversation();
      }

      await this.setInputValue('div[contenteditable="true"]', message);
      console.log('Gemini: 消息输入完成');

      await delay(500);

      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('Gemini: 找到发送按钮');

      this.simulateClick(sendButton as HTMLElement);
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

  protected async startNewConversation(): Promise<void> {
    const slideBar = await this.waitForElement<HTMLButtonElement>(
      'button[aria-label="主菜单"]'
    );
    let newChatButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="发起新对话"]'
    );
    if (!newChatButton) {
      this.simulateClick(slideBar);
      await delay(500);
    }
    newChatButton = await this.waitForElement<HTMLButtonElement>(
      'button[aria-label="发起新对话"]'
    );
    if (!newChatButton) {
      throw new Error('错误：无法找到发起新对话按钮。');
    }
    this.simulateClick(newChatButton);
    await delay(1000);
  }
}
