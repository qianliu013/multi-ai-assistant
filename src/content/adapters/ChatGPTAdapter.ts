import { BaseAdapter } from './BaseAdapter';
import type { ContentResponse, ConversationMode } from '@/shared/types';
import { delay } from '@/shared/utils';

export class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super('ChatGPT', {
      sendButton: 'button#composer-submit-button',
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

      await this.setInputValue('.ProseMirror', message);
      console.log('ChatGPT: 消息输入完成');

      // 等待一小段时间让输入生效
      await delay(500);

      // 查找并点击发送按钮
      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('ChatGPT: 找到发送按钮');

      this.simulateClick(sendButton as HTMLElement);
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

  protected async startNewConversation(): Promise<void> {
    const event = new KeyboardEvent('keydown', {
      key: 'O',
      code: 'KeyO',
      shiftKey: true,
      metaKey: true, // Mac 上 Command 键是 metaKey
      bubbles: true,
    });
    document.body.dispatchEvent(event);
    await delay(200);
  }
}
