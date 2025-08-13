// popup.js - 弹出页面的主要逻辑

class PopupManager {
  constructor() {
    this.messageInput = document.getElementById('message-input');
    this.charCounter = document.getElementById('char-counter');
    this.sendBtn = document.getElementById('send-btn');
    this.sendText = document.getElementById('send-text');
    this.loading = document.getElementById('loading');
    this.statusMessages = document.getElementById('status-messages');
    
    this.aiCheckboxes = {
      chatgpt: document.getElementById('chatgpt'),
      claude: document.getElementById('claude'),
      gemini: document.getElementById('gemini')
    };
    
    this.aiStatusElements = {
      chatgpt: document.getElementById('chatgpt-status'),
      claude: document.getElementById('claude-status'),
      gemini: document.getElementById('gemini-status')
    };
    
    this.selectAllBtn = document.getElementById('select-all');
    this.selectNoneBtn = document.getElementById('select-none');
    this.conversationModeInputs = document.querySelectorAll('input[name="conversation-mode"]');
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateCharCounter();
    this.checkAITabStatus();
    this.loadSavedSettings();
  }
  
  setupEventListeners() {
    // 字符计数
    this.messageInput.addEventListener('input', () => {
      this.updateCharCounter();
      this.validateInput();
    });
    
    // 快捷键支持
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.handleSend();
      }
    });
    
    // 发送按钮
    this.sendBtn.addEventListener('click', () => {
      this.handleSend();
    });
    
    // 全选/全不选
    this.selectAllBtn.addEventListener('click', () => {
      this.setAllAISelection(true);
    });
    
    this.selectNoneBtn.addEventListener('click', () => {
      this.setAllAISelection(false);
    });
    
    // AI选择变化
    Object.values(this.aiCheckboxes).forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.validateInput();
        this.saveSettings();
      });
    });
    
    // 对话模式变化
    this.conversationModeInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.saveSettings();
      });
    });
  }
  
  updateCharCounter() {
    const length = this.messageInput.value.length;
    this.charCounter.textContent = length;
    
    // 字符数警告
    if (length > 2000) {
      this.charCounter.style.color = '#dc3545';
    } else if (length > 1500) {
      this.charCounter.style.color = '#ffc107';
    } else {
      this.charCounter.style.color = '#666';
    }
  }
  
  validateInput() {
    const hasMessage = this.messageInput.value.trim().length > 0;
    const hasSelectedAI = Object.values(this.aiCheckboxes).some(cb => cb.checked);
    
    this.sendBtn.disabled = !hasMessage || !hasSelectedAI;
  }
  
  setAllAISelection(selected) {
    Object.values(this.aiCheckboxes).forEach(checkbox => {
      checkbox.checked = selected;
    });
    this.validateInput();
    this.saveSettings();
  }
  
  getSelectedAIs() {
    const selected = [];
    Object.entries(this.aiCheckboxes).forEach(([ai, checkbox]) => {
      if (checkbox.checked) {
        selected.push(ai);
      }
    });
    return selected;
  }
  
  getConversationMode() {
    const checkedMode = document.querySelector('input[name="conversation-mode"]:checked');
    return checkedMode ? checkedMode.value : 'continue';
  }
  
  async checkAITabStatus() {
    try {
      // 向background script查询AI tab状态
      const response = await chrome.runtime.sendMessage({
        action: 'checkAITabs'
      });
      
      if (response && response.tabStatus) {
        this.updateAIStatus(response.tabStatus);
      }
    } catch (error) {
      console.log('检查AI tab状态时出错:', error);
      // 如果background script还未准备好，设置默认状态
      this.setDefaultAIStatus();
    }
  }
  
  updateAIStatus(tabStatus) {
    Object.entries(this.aiStatusElements).forEach(([ai, element]) => {
      if (tabStatus[ai]) {
        element.textContent = '●';
        element.className = 'ai-status';
        element.title = '已打开';
      } else {
        element.textContent = '○';
        element.className = 'ai-status unavailable';
        element.title = '需要打开新标签页';
      }
    });
  }
  
  setDefaultAIStatus() {
    Object.values(this.aiStatusElements).forEach(element => {
      element.textContent = '○';
      element.className = 'ai-status unavailable';
      element.title = '需要打开新标签页';
    });
  }
  
  async handleSend() {
    const message = this.messageInput.value.trim();
    const selectedAIs = this.getSelectedAIs();
    const conversationMode = this.getConversationMode();
    
    if (!message || selectedAIs.length === 0) {
      this.showStatus('请输入消息并选择至少一个AI', 'error');
      return;
    }
    
    // 显示发送状态
    this.setLoading(true);
    this.clearStatusMessages();
    
    try {
      // 向background script发送消息
      const response = await chrome.runtime.sendMessage({
        action: 'sendToAIs',
        message: message,
        selectedAIs: selectedAIs,
        conversationMode: conversationMode
      });
      
      if (response && response.success) {
        this.showStatus(`正在向 ${selectedAIs.join(', ')} 发送消息...`, 'info');
        
        // 清空输入框
        this.messageInput.value = '';
        this.updateCharCounter();
        
        // 等待发送结果
        this.waitForSendResults();
      } else {
        this.showStatus(response?.error || '发送失败', 'error');
      }
    } catch (error) {
      console.error('发送消息时出错:', error);
      this.showStatus('发送失败: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }
  
  async waitForSendResults() {
    // 监听background script的发送结果
    const handleMessage = (message, sender, sendResponse) => {
      if (message.action === 'sendResult') {
        const { ai, success, error } = message;
        if (success) {
          this.showStatus(`✓ ${ai} 发送成功`, 'success');
        } else {
          this.showStatus(`✗ ${ai} 发送失败: ${error}`, 'error');
        }
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    // 5秒后移除监听器
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    }, 5000);
  }
  
  setLoading(loading) {
    if (loading) {
      this.sendText.classList.add('hidden');
      this.loading.classList.remove('hidden');
      this.sendBtn.disabled = true;
    } else {
      this.sendText.classList.remove('hidden');
      this.loading.classList.add('hidden');
      this.validateInput();
    }
  }
  
  showStatus(message, type = 'info') {
    const statusElement = document.createElement('div');
    statusElement.className = `status-message ${type}`;
    statusElement.textContent = message;
    
    this.statusMessages.appendChild(statusElement);
    
    // 自动移除状态消息
    setTimeout(() => {
      if (statusElement.parentNode) {
        statusElement.parentNode.removeChild(statusElement);
      }
    }, 5000);
  }
  
  clearStatusMessages() {
    this.statusMessages.innerHTML = '';
  }
  
  saveSettings() {
    const settings = {
      selectedAIs: this.getSelectedAIs(),
      conversationMode: this.getConversationMode()
    };
    
    chrome.storage.local.set({ popupSettings: settings });
  }
  
  async loadSavedSettings() {
    try {
      const result = await chrome.storage.local.get(['popupSettings']);
      if (result.popupSettings) {
        const settings = result.popupSettings;
        
        // 恢复AI选择
        if (settings.selectedAIs) {
          Object.entries(this.aiCheckboxes).forEach(([ai, checkbox]) => {
            checkbox.checked = settings.selectedAIs.includes(ai);
          });
        }
        
        // 恢复对话模式
        if (settings.conversationMode) {
          const modeInput = document.querySelector(`input[name="conversation-mode"][value="${settings.conversationMode}"]`);
          if (modeInput) {
            modeInput.checked = true;
          }
        }
        
        this.validateInput();
      }
    } catch (error) {
      console.log('加载设置时出错:', error);
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});