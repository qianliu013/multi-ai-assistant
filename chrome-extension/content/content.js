// content.js - 内容脚本，注入到AI网站页面

class ContentManager {
  constructor() {
    this.adapter = null;
    this.initialized = false;
    this.init();
  }
  
  async init() {
    try {
      // 创建对应的AI适配器
      this.adapter = this.createAdapter();
      
      if (this.adapter) {
        console.log(`初始化 ${this.adapter.name} 适配器`);
        await this.adapter.initialize();
        this.initialized = true;
        
        // 监听来自background的消息
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          this.handleMessage(message, sender, sendResponse);
          return true; // 保持消息通道开放
        });
        
        console.log(`${this.adapter.name} 内容脚本初始化完成`);
      } else {
        console.log('当前页面不是支持的AI网站');
      }
    } catch (error) {
      console.error('内容脚本初始化失败:', error);
    }
  }
  
  createAdapter() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname.includes('openai.com') && pathname.startsWith('/c/')) {
      return new ChatGPTAdapter();
    } else if (hostname.includes('claude.ai')) {
      return new ClaudeAdapter();  
    } else if (hostname.includes('google.com') && (pathname.includes('/app/') || pathname.includes('/chat'))) {
      return new GeminiAdapter();
    }
    
    return null;
  }
  
  async handleMessage(message, sender, sendResponse) {
    try {
      if (!this.initialized || !this.adapter) {
        throw new Error('适配器未初始化');
      }
      
      switch (message.action) {
        case 'sendMessage':
          const result = await this.adapter.sendMessage(
            message.message, 
            message.conversationMode
          );
          sendResponse({ success: true, result });
          break;
          
        default:
          sendResponse({ success: false, error: '未知的操作类型' });
      }
    } catch (error) {
      console.error('处理消息时出错:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
}

// 基础适配器类
class BaseAdapter {
  constructor(name) {
    this.name = name;
    this.selectors = {};
    this.initialized = false;
  }
  
  async initialize() {
    // 等待页面加载完成
    await this.waitForPageLoad();
    this.initialized = true;
  }
  
  async waitForPageLoad(timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (document.readyState === 'complete') {
        resolve();
        return;
      }
      
      const timeoutId = setTimeout(() => {
        reject(new Error('页面加载超时'));
      }, timeout);
      
      const handleLoad = () => {
        clearTimeout(timeoutId);
        document.removeEventListener('DOMContentLoaded', handleLoad);
        window.removeEventListener('load', handleLoad);
        resolve();
      };
      
      document.addEventListener('DOMContentLoaded', handleLoad);
      window.addEventListener('load', handleLoad);
    });
  }
  
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
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
        subtree: true
      });
    });
  }
  
  async simulateTyping(element, text, delay = 50) {
    // 模拟真实的打字行为
    element.focus();
    
    for (let char of text) {
      element.value += char;
      
      // 触发输入事件
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('keyup', { bubbles: true }));
      
      // 随机延迟
      await this.delay(delay + Math.random() * 50);
    }
    
    // 最后触发change事件
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  async simulateClick(element) {
    // 模拟真实的点击行为
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await this.delay(50);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 子类需要实现的方法
  async sendMessage(message, conversationMode) {
    throw new Error('子类必须实现 sendMessage 方法');
  }
}

// ChatGPT 适配器
class ChatGPTAdapter extends BaseAdapter {
  constructor() {
    super('ChatGPT');
    this.selectors = {
      inputBox: 'textarea[placeholder*="Message"], #prompt-textarea, textarea[data-testid="textbox"]',
      sendButton: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
      newChatButton: 'a[href="/"], button:contains("New chat")',
      messageContainer: '[data-testid="conversation-turn"]'
    };
  }
  
  async sendMessage(message, conversationMode) {
    try {
      console.log(`ChatGPT: 准备发送消息`, { message, conversationMode });
      
      // 如果是新对话模式，尝试点击新对话按钮
      if (conversationMode === 'new') {
        await this.startNewConversation();
      }
      
      // 等待输入框出现
      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('ChatGPT: 找到输入框');
      
      // 清空现有内容
      inputBox.value = '';
      inputBox.textContent = '';
      
      // 模拟输入
      if (inputBox.tagName.toLowerCase() === 'textarea') {
        await this.simulateTyping(inputBox, message);
      } else {
        // 对于contenteditable元素
        inputBox.textContent = message;
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      console.log('ChatGPT: 消息输入完成');
      
      // 等待一小段时间让输入生效
      await this.delay(500);
      
      // 查找并点击发送按钮
      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('ChatGPT: 找到发送按钮');
      
      await this.simulateClick(sendButton);
      console.log('ChatGPT: 消息发送完成');
      
      return { success: true };
    } catch (error) {
      console.error('ChatGPT 发送消息失败:', error);
      throw error;
    }
  }
  
  async startNewConversation() {
    try {
      // 尝试找到新对话按钮并点击
      const newChatButton = document.querySelector(this.selectors.newChatButton);
      if (newChatButton) {
        await this.simulateClick(newChatButton);
        await this.delay(1000); // 等待页面跳转
      }
    } catch (error) {
      console.log('ChatGPT: 无法开始新对话，继续使用当前对话');
    }
  }
}

// Claude 适配器  
class ClaudeAdapter extends BaseAdapter {
  constructor() {
    super('Claude');
    this.selectors = {
      inputBox: 'div[contenteditable="true"], textarea[placeholder*="Talk to Claude"]',
      sendButton: 'button[aria-label="Send Message"], button:contains("Send")',
      newChatButton: 'button:contains("Start new conversation"), a[href="/chat"]'
    };
  }
  
  async sendMessage(message, conversationMode) {
    try {
      console.log(`Claude: 准备发送消息`, { message, conversationMode });
      
      if (conversationMode === 'new') {
        await this.startNewConversation();
      }
      
      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('Claude: 找到输入框');
      
      // 清空现有内容
      if (inputBox.tagName.toLowerCase() === 'textarea') {
        inputBox.value = '';
        await this.simulateTyping(inputBox, message);
      } else {
        inputBox.textContent = '';
        inputBox.innerHTML = message;
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      console.log('Claude: 消息输入完成');
      await this.delay(500);
      
      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('Claude: 找到发送按钮');
      
      await this.simulateClick(sendButton);
      console.log('Claude: 消息发送完成');
      
      return { success: true };
    } catch (error) {
      console.error('Claude 发送消息失败:', error);
      throw error;
    }
  }
  
  async startNewConversation() {
    try {
      const newChatButton = document.querySelector(this.selectors.newChatButton);
      if (newChatButton) {
        await this.simulateClick(newChatButton);
        await this.delay(1000);
      }
    } catch (error) {
      console.log('Claude: 无法开始新对话，继续使用当前对话');
    }
  }
}

// Gemini 适配器
class GeminiAdapter extends BaseAdapter {
  constructor() {
    super('Gemini');
    this.selectors = {
      inputBox: 'rich-textarea textarea, textarea[aria-label*="Enter a prompt"]',
      sendButton: 'button[aria-label="Send message"], button[aria-label="Send"]',
      newChatButton: '[data-test-id="new-conversation-button"], button:contains("New chat")'
    };
  }
  
  async sendMessage(message, conversationMode) {
    try {
      console.log(`Gemini: 准备发送消息`, { message, conversationMode });
      
      if (conversationMode === 'new') {
        await this.startNewConversation();
      }
      
      const inputBox = await this.waitForElement(this.selectors.inputBox);
      console.log('Gemini: 找到输入框');
      
      inputBox.value = '';
      await this.simulateTyping(inputBox, message);
      
      console.log('Gemini: 消息输入完成');
      await this.delay(500);
      
      const sendButton = await this.waitForElement(this.selectors.sendButton);
      console.log('Gemini: 找到发送按钮');
      
      await this.simulateClick(sendButton);
      console.log('Gemini: 消息发送完成');
      
      return { success: true };
    } catch (error) {
      console.error('Gemini 发送消息失败:', error);
      throw error;
    }
  }
  
  async startNewConversation() {
    try {
      const newChatButton = document.querySelector(this.selectors.newChatButton);
      if (newChatButton) {
        await this.simulateClick(newChatButton);
        await this.delay(1000);
      }
    } catch (error) {
      console.log('Gemini: 无法开始新对话，继续使用当前对话');
    }
  }
}

// 初始化内容管理器
new ContentManager();