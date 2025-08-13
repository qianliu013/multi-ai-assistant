import type {
  AIAdapter,
  AISelectors,
  ContentResponse,
  ConversationMode,
} from '@/shared/types';

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

  protected async waitForElement<T extends Element = Element>(
    selector: string,
    timeout: number = 5000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector) as T;
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((_mutations, obs) => {
        const element = document.querySelector(selector) as T;
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

  protected async simulateClick(element: HTMLElement): Promise<void> {
    element.click();
  }

  protected async setInputValue(
    selector: string,
    message: string
  ): Promise<void> {
    // 1. 定位关键元素
    const editor = await this.waitForElement<HTMLDivElement>(selector);

    if (!editor) {
      throw new Error('错误：无法找到输入框元素。');
    }

    // contenteditable 通常会将文本放在一个 <p> 标签里
    let targetNode = editor.querySelector('p');
    if (!targetNode) {
      targetNode = document.createElement('p');
      editor.appendChild(targetNode);
    }

    // 2. 聚焦输入框
    editor.focus();

    // 3. 修改 DOM 内容
    // 直接设置 innerText 是最直接的方式
    targetNode.innerText = message;

    // 4. 派发 'input' 事件，这是通知框架内容变化的关键
    // 我们需要设置 'bubbles: true' 和 'composed: true' 以便事件能被框架的监听器捕获
    const inputEvent = new InputEvent('input', {
      inputType: 'insertText',
      data: message,
      bubbles: true,
      composed: true, // 允许事件穿透 Shadow DOM（如果存在）
    });

    editor.dispatchEvent(inputEvent);
  }

  // 子类需要实现的方法
  abstract sendMessage(
    message: string,
    conversationMode: ConversationMode
  ): Promise<ContentResponse>;
}
