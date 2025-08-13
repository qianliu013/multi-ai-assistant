import type {
  AIAdapter,
  AISelectors,
  ContentResponse,
  ConversationMode,
} from '@/shared/types';
import { delay } from '@/shared/utils';

export abstract class BaseAdapter implements AIAdapter {
  public readonly name: string;
  protected selectors: AISelectors;
  protected initialized: boolean = false;

  constructor(name: string, selectors: AISelectors) {
    this.name = name;
    this.selectors = selectors;
  }

  async initialize(): Promise<void> {
    // 等待页面加载完成
    await this.waitForPageLoad();
    this.initialized = true;
  }

  private async waitForPageLoad(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.readyState === 'complete') {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('页面加载超时'));
      }, timeout);

      const handleLoad = (): void => {
        clearTimeout(timeoutId);
        document.removeEventListener('DOMContentLoaded', handleLoad);
        window.removeEventListener('load', handleLoad);
        resolve();
      };

      document.addEventListener('DOMContentLoaded', handleLoad);
      window.addEventListener('load', handleLoad);
    });
  }

  protected async waitForElement(
    selector: string,
    timeout: number = 5000
  ): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((_mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`元素 ${selector} 等待超时`));
      }, timeout);

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  protected async simulateTyping(
    element: HTMLElement,
    text: string,
    delayMs: number = 50
  ): Promise<void> {
    // 模拟真实的打字行为
    element.focus();

    if (
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLInputElement
    ) {
      // 对于input/textarea元素
      element.value = '';
      for (const char of text) {
        element.value += char;

        // 触发输入事件
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('keyup', { bubbles: true }));

        // 随机延迟
        await delay(delayMs + Math.random() * 50);
      }

      // 最后触发change事件
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // 对于contenteditable元素
      element.textContent = '';
      for (const char of text) {
        element.textContent += char;

        // 触发输入事件
        element.dispatchEvent(new Event('input', { bubbles: true }));

        // 随机延迟
        await delay(delayMs + Math.random() * 50);
      }
    }
  }

  protected async simulateClick(element: HTMLElement): Promise<void> {
    // 模拟真实的点击行为
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await delay(50);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  // 子类需要实现的方法
  abstract sendMessage(
    message: string,
    conversationMode: ConversationMode
  ): Promise<ContentResponse>;

  // 子类可以重写的方法
  protected async startNewConversation(): Promise<void> {
    try {
      if (this.selectors.newChatButton) {
        const newChatButton = document.querySelector(
          this.selectors.newChatButton
        ) as HTMLElement;
        if (newChatButton) {
          await this.simulateClick(newChatButton);
          await delay(1000); // 等待页面跳转
        }
      }
    } catch (error) {
      console.log(`${this.name}: 无法开始新对话，继续使用当前对话`);
    }
  }
}
