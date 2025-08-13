/* eslint-disable no-console */
// 共享工具函数

import type { AIProvider } from './types';

/**
 * 延迟执行
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取当前URL的AI提供商
 */
export const getAIProviderFromURL = (url: string): AIProvider | null => {
  const hostname = new URL(url).hostname;

  if (hostname.includes('chatgpt.com')) {
    return 'chatgpt';
  } else if (hostname.includes('claude.ai')) {
    return 'claude';
  } else if (hostname.includes('gemini.google.com')) {
    return 'gemini';
  }

  return null;
};

/**
 * 验证消息是否有效
 */
export const isValidMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.trim().length <= 4000;
};

/**
 * 格式化字符计数显示
 */
export const formatCharCount = (
  count: number
): {
  text: string;
  color: string;
} => {
  if (count > 3000) {
    return { text: `${count}/4000`, color: 'text-red-500' };
  } else if (count > 2000) {
    return { text: `${count}/4000`, color: 'text-yellow-500' };
  } else {
    return { text: `${count}/4000`, color: 'text-gray-500' };
  }
};

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
  );
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * Chrome存储API的封装
 */
export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const result = await chrome.storage.local.get([key]);
      return (result[key] as T) ?? defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove([key]);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
};

/**
 * 错误处理工具
 */
export const handleError = (error: unknown, context: string): string => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return `Unknown error in ${context}`;
};
