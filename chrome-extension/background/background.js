// background.js - Chrome扩展的后台服务脚本

class BackgroundManager {
  constructor() {
    this.aiUrls = {
      chatgpt: 'https://chat.openai.com',
      claude: 'https://claude.ai',
      gemini: 'https://gemini.google.com'
    };
    
    this.init();
  }
  
  init() {
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // 保持消息通道开放以支持异步响应
    });
    
    // 监听扩展安装事件
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Multi-AI Assistant 扩展已安装');
    });
  }
  
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'checkAITabs':
          const tabStatus = await this.checkAITabs();
          sendResponse({ tabStatus });
          break;
          
        case 'sendToAIs':
          const result = await this.sendToAIs(message);
          sendResponse(result);
          break;
          
        default:
          sendResponse({ error: '未知的操作类型' });
      }
    } catch (error) {
      console.error('处理消息时出错:', error);
      sendResponse({ error: error.message });
    }
  }
  
  async checkAITabs() {
    try {
      const tabs = await chrome.tabs.query({});
      const tabStatus = {};
      
      // 检查每个AI网站是否已经打开
      Object.entries(this.aiUrls).forEach(([ai, url]) => {
        tabStatus[ai] = tabs.some(tab => 
          tab.url && tab.url.startsWith(url)
        );
      });
      
      return tabStatus;
    } catch (error) {
      console.error('检查AI tabs时出错:', error);
      return {};
    }
  }
  
  async sendToAIs({ message, selectedAIs, conversationMode }) {
    try {
      console.log('开始发送消息到AIs:', { message, selectedAIs, conversationMode });
      
      // 并行处理所有选中的AI
      const sendPromises = selectedAIs.map(ai => 
        this.sendToSingleAI(ai, message, conversationMode)
      );
      
      // 等待所有发送完成（不管成功或失败）
      await Promise.allSettled(sendPromises);
      
      return { success: true };
    } catch (error) {
      console.error('发送到AIs时出错:', error);
      return { success: false, error: error.message };
    }
  }
  
  async sendToSingleAI(ai, message, conversationMode) {
    try {
      console.log(`开始发送到 ${ai}:`, { message, conversationMode });
      
      // 查找或创建AI tab
      const tab = await this.findOrCreateAITab(ai, conversationMode);
      
      if (!tab) {
        throw new Error(`无法创建或找到 ${ai} 的标签页`);
      }
      
      // 等待tab加载完成
      await this.waitForTabLoad(tab.id);
      
      // 向content script发送消息
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'sendMessage',
        message: message,
        conversationMode: conversationMode
      });
      
      // 通知popup发送结果
      chrome.runtime.sendMessage({
        action: 'sendResult',
        ai: ai,
        success: true
      });
      
      console.log(`${ai} 发送成功:`, response);
      return response;
      
    } catch (error) {
      console.error(`发送到 ${ai} 时出错:`, error);
      
      // 通知popup发送失败
      chrome.runtime.sendMessage({
        action: 'sendResult',
        ai: ai,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  async findOrCreateAITab(ai, conversationMode) {
    try {
      const aiUrl = this.aiUrls[ai];
      if (!aiUrl) {
        throw new Error(`未知的AI类型: ${ai}`);
      }
      
      // 查找现有的AI tab
      const tabs = await chrome.tabs.query({});
      let existingTab = tabs.find(tab => 
        tab.url && tab.url.startsWith(aiUrl)
      );
      
      // 如果需要新对话且找到了现有tab，重新加载到首页
      if (existingTab && conversationMode === 'new') {
        await chrome.tabs.update(existingTab.id, { url: aiUrl });
        return existingTab;
      }
      
      // 如果找到现有tab且是继续对话模式，直接使用
      if (existingTab && conversationMode === 'continue') {
        await chrome.tabs.update(existingTab.id, { active: true });
        return existingTab;
      }
      
      // 创建新tab
      const newTab = await chrome.tabs.create({
        url: aiUrl,
        active: false // 不要自动切换到新tab
      });
      
      return newTab;
      
    } catch (error) {
      console.error(`查找或创建 ${ai} tab时出错:`, error);
      throw error;
    }
  }
  
  async waitForTabLoad(tabId, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Tab加载超时'));
      }, timeout);
      
      const checkTab = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          if (tab.status === 'complete') {
            clearTimeout(timeoutId);
            // 额外等待一点时间确保页面完全加载
            setTimeout(resolve, 1000);
          } else {
            setTimeout(checkTab, 500);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };
      
      checkTab();
    });
  }
}

// 初始化后台管理器
const backgroundManager = new BackgroundManager();

// 导出给测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundManager;
}