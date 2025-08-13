# Chrome多AI助手插件实现规划

## 项目概述

### 功能需求
1. **统一输入界面**：提供一个弹出页面，包含输入框供用户输入消息
2. **多AI支持**：支持同时向ChatGPT、Claude、Gemini发送消息
3. **智能Tab管理**：自动检测现有AI网站tab，或新建tab
4. **对话模式选择**：支持新建对话或继续现有对话
5. **模拟人工操作**：通过DOM操作而非API调用来发送消息

### 核心价值
- 提升效率：一次输入，多AI响应
- 无需API密钥：直接使用网页版AI服务
- 自然交互：模拟真实用户操作

## 技术架构设计

### 插件组件结构
```
chrome-extension/
├── manifest.json           # 插件配置文件
├── popup/
│   ├── popup.html          # 弹出页面UI
│   ├── popup.js            # 弹出页面逻辑
│   └── popup.css           # 样式文件
├── background/
│   └── background.js       # 后台服务脚本
├── content/
│   ├── content.js          # 内容脚本主文件
│   └── ai-adapters/        # 各AI网站适配器
│       ├── chatgpt.js
│       ├── claude.js
│       └── gemini.js
└── assets/
    └── icons/              # 插件图标
```

### 关键技术要点

#### 1. Chrome Extension架构
- **Manifest V3**：使用最新的插件规范
- **Popup页面**：用户交互界面
- **Background Script**：管理tabs和消息传递
- **Content Script**：注入到AI网站页面，执行DOM操作

#### 2. 消息传递机制
```
Popup ←→ Background ←→ Content Script
     (chrome.runtime)  (chrome.tabs)
```

## 详细设计方案

### 1. 用户界面设计（popup.html）

#### 界面元素
- **消息输入区域**
  - 多行文本框，支持大段文本输入
  - 字符计数显示
  - 快捷键支持（Ctrl+Enter发送）

- **AI选择区域**
  - 复选框：ChatGPT、Claude、Gemini
  - 全选/全不选按钮
  - 状态指示器（已打开tab、需要新建tab）

- **发送选项**
  - 单选按钮：继续现有对话 / 新建对话
  - 发送按钮
  - 进度指示器

#### 交互流程
1. 用户输入消息
2. 选择目标AI（可多选）
3. 选择对话模式
4. 点击发送
5. 显示发送状态和结果

### 2. Tab管理策略（background.js）

#### 功能实现
```javascript
// 核心功能伪代码
class TabManager {
  async findAITabs() {
    // 查找现有AI网站tabs
    const tabs = await chrome.tabs.query({});
    return {
      chatgpt: tabs.find(tab => tab.url.includes('chat.openai.com')),
      claude: tabs.find(tab => tab.url.includes('claude.ai')),
      gemini: tabs.find(tab => tab.url.includes('gemini.google.com'))
    };
  }
  
  async createOrActivateTab(aiType, newConversation) {
    // 创建新tab或激活现有tab
    // 如果需要新对话，重定向到首页
  }
}
```

#### Tab状态管理
- **检测逻辑**：通过URL模式匹配识别AI网站
- **创建策略**：不存在时新建，存在时激活
- **新对话处理**：重定向到首页或点击"新对话"按钮

### 3. 内容注入策略（content.js）

#### AI网站适配器设计
每个AI网站需要独立的适配器，处理以下任务：

##### ChatGPT适配器（chatgpt.js）
```javascript
class ChatGPTAdapter {
  selectors = {
    inputBox: 'textarea[placeholder*="Message"]',
    sendButton: 'button[data-testid="send-button"]',
    newChatButton: 'nav a[href="/"]'
  };
  
  async waitForLoad() {
    // 等待页面加载完成
  }
  
  async startNewConversation() {
    // 点击新对话按钮
  }
  
  async sendMessage(text) {
    // 1. 找到输入框
    // 2. 模拟输入文本
    // 3. 点击发送按钮
  }
}
```

##### Claude适配器（claude.js）
```javascript
class ClaudeAdapter {
  selectors = {
    inputBox: 'div[contenteditable="true"]',
    sendButton: 'button[aria-label="Send Message"]',
    newChatButton: 'button:contains("New Chat")'
  };
  
  // 类似的方法实现
}
```

##### Gemini适配器（gemini.js）
```javascript
class GeminiAdapter {
  selectors = {
    inputBox: 'rich-textarea textarea',
    sendButton: 'button[aria-label="Send message"]',
    newChatButton: '[data-test-id="new-conversation-button"]'
  };
  
  // 类似的方法实现
}
```

#### 通用内容脚本逻辑
```javascript
// content.js主文件
class ContentManager {
  constructor() {
    this.adapter = this.createAdapter();
  }
  
  createAdapter() {
    const hostname = window.location.hostname;
    if (hostname.includes('openai.com')) return new ChatGPTAdapter();
    if (hostname.includes('claude.ai')) return new ClaudeAdapter();
    if (hostname.includes('google.com')) return new GeminiAdapter();
  }
  
  async handleMessage(request) {
    const { text, newConversation } = request;
    
    if (newConversation) {
      await this.adapter.startNewConversation();
    }
    
    await this.adapter.waitForLoad();
    await this.adapter.sendMessage(text);
  }
}
```

### 4. 错误处理和重试机制

#### 常见问题处理
1. **页面加载超时**：设置合理的等待时间和重试机制
2. **元素定位失败**：使用多个备选选择器，增强鲁棒性
3. **登录状态检测**：检查是否需要用户登录
4. **网站结构变化**：提供选择器更新机制

#### 重试策略
```javascript
class RetryManager {
  async executeWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(1000 * (i + 1)); // 递增延迟
      }
    }
  }
}
```

## 实现步骤

### 阶段1：基础框架搭建
1. 创建manifest.json，配置基本权限
2. 实现popup页面的UI和基础交互
3. 搭建background script的tab管理功能
4. 实现popup与background的消息传递

### 阶段2：单一AI适配器实现
1. 选择一个AI（推荐ChatGPT）作为首个目标
2. 实现对应的content script和适配器
3. 完成消息发送的完整流程
4. 测试和调试基础功能

### 阶段3：多AI支持扩展
1. 实现Claude适配器
2. 实现Gemini适配器
3. 完善多AI并发发送逻辑
4. 实现发送状态反馈

### 阶段4：功能完善和优化
1. 添加错误处理和重试机制
2. 实现新对话功能
3. 优化用户体验（加载状态、成功反馈等）
4. 添加配置选项（延迟设置、选择器自定义等）

### 阶段5：测试和发布
1. 全面功能测试
2. 兼容性测试（不同浏览器版本）
3. 打包和发布准备
4. 用户文档编写

## 权限配置（manifest.json）

```json
{
  "manifest_version": 3,
  "name": "Multi-AI Assistant",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "tabs",
    "storage"
  ],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*"
  ],
  "action": {
    "default_popup": "popup/popup.html"
  },
  "background": {
    "service_worker": "background/background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "https://chat.openai.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*"
      ],
      "js": ["content/content.js"]
    }
  ]
}
```

## 技术挑战和解决方案

### 1. 动态页面结构
**挑战**：AI网站可能使用动态加载，元素选择器可能变化
**解决方案**：
- 使用MutationObserver监听DOM变化
- 提供多套备选选择器
- 实现选择器自动更新机制

### 2. 反爬虫检测
**挑战**：网站可能检测自动化操作
**解决方案**：
- 模拟真实用户行为（输入延迟、鼠标事件）
- 随机化操作时间间隔
- 避免过于频繁的操作

### 3. 跨站点一致性
**挑战**：不同AI网站的交互模式差异很大
**解决方案**：
- 采用适配器模式，为每个网站单独实现
- 定义统一的接口规范
- 可配置的网站特定参数

### 4. 用户体验优化
**挑战**：操作响应时间、错误反馈、状态显示
**解决方案**：
- 实现实时状态更新
- 详细的错误信息提示
- 可取消的操作流程

## 安全和隐私考虑

### 1. 数据安全
- 不存储用户输入的敏感内容
- 使用chrome.storage.local而非sync避免云同步
- 加密存储配置信息

### 2. 权限最小化
- 只请求必要的权限
- 使用activeTab而非全部tabs权限
- 限制host_permissions范围

### 3. 用户隐私
- 明确说明数据使用范围
- 提供数据清除选项
- 不收集用户行为数据

## 预期问题和解决方案

### 1. 维护成本
**问题**：AI网站频繁更新可能导致选择器失效
**解决**：
- 建立自动化测试流程
- 提供用户反馈机制
- 实现热更新机制

### 2. 性能优化
**问题**：同时操作多个tab可能影响浏览器性能
**解决**：
- 实现排队机制，避免并发过多
- 优化内存使用
- 提供发送间隔配置

### 3. 兼容性问题
**问题**：不同浏览器或版本的兼容性
**解决**：
- 使用标准Web API
- 避免浏览器特定功能
- 提供降级方案

## 总结

这个Chrome插件项目具有一定的技术复杂性，主要挑战在于：
1. 适配多个不同的AI网站
2. 处理动态页面结构变化
3. 确保操作的可靠性和用户体验

通过采用模块化设计、适配器模式、以及完善的错误处理机制，可以实现一个稳定可用的多AI助手插件。

项目预计开发周期：2-3周
核心难点：网站适配和DOM操作的可靠性
成功关键：充分的测试和持续的维护更新