# Multi-AI Assistant Chrome Extension

一个现代化的Chrome浏览器扩展，允许用户在一个界面中同时向多个AI助手（ChatGPT、Claude、Gemini）发送消息。

## ✨ 功能特点

- 🤖 **多AI支持**: 同时向ChatGPT、Claude、Gemini发送消息
- 💡 **智能状态检测**: 实时显示AI网站连接状态
- 🔄 **灵活对话模式**: 支持继续现有对话或开始新对话
- 📊 **字符统计**: 实时显示消息字符数和限制提示
- 📱 **响应式设计**: 自适应界面，优雅的视觉效果
- 💾 **设置记忆**: 自动保存用户偏好设置
- ⚡ **快速响应**: 现代化React界面，流畅交互体验

## 🛠️ 技术栈

### 核心技术
- **构建工具**: Rsbuild (基于Rspack的高性能构建工具)
- **前端框架**: React 18 + TypeScript 5.x
- **样式方案**: Tailwind CSS 3.x
- **包管理器**: pnpm

### 开发工具链
- **代码质量**: ESLint + Prettier + TypeScript strict mode
- **图标系统**: Lucide React
- **类型安全**: 完整的 TypeScript 类型定义
- **Chrome扩展**: Manifest V3

## 🚀 快速开始

### 前置要求
- Node.js 16+
- pnpm 8+

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm run dev
```

### 生产构建
```bash
pnpm run build
```

### 安装到Chrome
1. 运行 `pnpm run build` 构建扩展
2. 打开 Chrome 浏览器
3. 访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择项目的 `dist` 文件夹

## 📁 项目结构

```
src/
├── popup/                  # React弹出界面
│   ├── components/         # React组件
│   │   ├── Header.tsx      # 头部组件
│   │   ├── MessageInput.tsx # 消息输入组件
│   │   ├── AISelector.tsx   # AI选择器组件
│   │   └── ...
│   ├── hooks/              # React Hooks
│   └── App.tsx             # 主应用组件
├── background/             # 后台服务
│   └── background.ts       # Service Worker
├── content/                # 内容脚本
│   ├── adapters/           # AI适配器
│   │   ├── ChatGPTAdapter.ts
│   │   ├── ClaudeAdapter.ts
│   │   └── GeminiAdapter.ts
│   └── content.ts
└── shared/                 # 共享代码
    ├── types.ts            # 类型定义
    └── utils.ts            # 工具函数
```

## 🎯 使用方法

1. **选择AI助手**: 在弹出界面中选择要使用的AI助手（可多选）
2. **输入消息**: 在文本框中输入你的消息
3. **选择模式**: 
   - 新对话：开始全新的对话
   - 继续对话：在现有对话中继续
4. **发送消息**: 点击发送按钮，消息将同时发送到选中的AI助手
5. **查看状态**: 实时查看发送状态和连接情况

## 🔧 开发脚本

```bash
# 开发模式
pnpm run dev

# 生产构建
pnpm run build

# 预览构建结果
pnpm run preview

# 类型检查
pnpm run type-check

# 代码检查和修复
pnpm run lint
pnpm run lint:fix

# 代码格式化
pnpm run format
pnpm run format:check

# 清理构建文件
pnpm run clean
```

## 🏗️ 构建优化

- ⚡ **高性能构建**: 基于Rspack的极速构建
- 📦 **优化打包**: 针对Chrome扩展优化的构建配置
- 🔍 **类型安全**: 100% TypeScript覆盖
- 🎨 **代码质量**: ESLint + Prettier自动化代码质量控制

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果你发现了bug或有功能建议，请在 [Issues](https://github.com/onefinis/ai-assistant/issues) 页面提交。

## ⭐ 支持项目

如果这个项目对你有帮助，请给一个 ⭐ Star！

---

**开发状态**: ✅ 稳定版本 v1.0.0  
**最后更新**: 2025-08-13  
**支持的AI平台**: ChatGPT, Claude, Gemini