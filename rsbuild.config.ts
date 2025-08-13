import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTypeCheck({
      tsCheckerOptions: {
        typescript: {
          configFile: resolve(__dirname, 'tsconfig.json'),
        },
      },
    }),
  ],
  
  source: {
    entry: {
      popup: resolve(__dirname, 'src/popup/main.tsx'),
      background: resolve(__dirname, 'src/background/background.ts'),
      content: resolve(__dirname, 'src/content/content.ts'),
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/popup': resolve(__dirname, 'src/popup'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/background': resolve(__dirname, 'src/background'),
      '@/content': resolve(__dirname, 'src/content'),
    },
  },

  output: {
    target: 'web',
    distPath: {
      root: 'dist',
      js: '.', // JS文件放在根目录
      css: '.', // CSS文件放在根目录
    },
    filename: {
      js: '[name].js',
      css: '[name].css',
    },
    assetPrefix: './', // 使用相对路径
    copy: [
      // 复制manifest.json到根目录
      { from: './public/manifest.json', to: './' },
      // 复制图标文件夹
      { from: './public/icons', to: './icons' },
    ],
  },

  html: {
    template: './src/popup/index.html',
    templateParameters: {
      title: 'Multi-AI Assistant',
    },
    scriptLoading: 'blocking',
    inject: 'body', // 将脚本注入到body底部而不是head
  },

  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    rspack: (config) => {
      // 为Chrome扩展优化配置
      config.output = {
        ...config.output,
        library: {
          type: 'iife',
        },
        globalObject: 'this',
      };

      // 为background和content脚本禁用代码分割
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
      
      return config;
    },
  },

  dev: {
    hmr: false, // Chrome扩展不支持HMR
    liveReload: false,
  },

  performance: {
    removeConsole: false,
    removeMomentLocale: true,
  },

  environments: {
    // 为不同的构建目标配置不同环境
    popup: {
      output: {
        target: 'web',
      },
    },
    background: {
      output: {
        target: 'web-worker',
      },
    },
    content: {
      output: {
        target: 'web',
      },
    },
  },
});