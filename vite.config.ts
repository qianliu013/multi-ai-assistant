import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';

// Chrome扩展构建插件
const chromeExtensionPlugin = () => {
  return {
    name: 'chrome-extension',
    writeBundle() {
      // 复制manifest.json到dist目录
      const manifestSrc = resolve(__dirname, 'public/manifest.json');
      const manifestDest = resolve(__dirname, 'dist/manifest.json');
      copyFileSync(manifestSrc, manifestDest);

      // 移动HTML文件到正确位置
      const htmlSrc = resolve(__dirname, 'dist/src/popup/index.html');
      const htmlDest = resolve(__dirname, 'dist/popup.html');
      if (existsSync(htmlSrc)) {
        copyFileSync(htmlSrc, htmlDest);
        // 删除源目录
        rmSync(resolve(__dirname, 'dist/src'), { recursive: true, force: true });
      }

      // 复制图标文件夹
      const iconsSrc = resolve(__dirname, 'public/icons');
      const iconsDest = resolve(__dirname, 'dist/icons');
      
      if (existsSync(iconsSrc)) {
        if (!existsSync(iconsDest)) {
          mkdirSync(iconsDest, { recursive: true });
        }
        
        // 复制所有图标文件
        const files = readdirSync(iconsSrc);
        files.forEach((file: string) => {
          copyFileSync(resolve(iconsSrc, file), resolve(iconsDest, file));
        });
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/popup': resolve(__dirname, 'src/popup'),
      '@/background': resolve(__dirname, 'src/background'),
      '@/content': resolve(__dirname, 'src/content'),
      '@/shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // 确保文件名正确
          if (chunkInfo.name === 'popup') return 'popup.js';
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          // popup.html 放在根目录
          if (assetInfo.name === 'index.html') return 'popup.html';
          if (assetInfo.name?.endsWith('.css')) return 'css/[name].[ext]';
          return 'assets/[name].[ext]';
        },
      },
    },
    // Chrome扩展需要这些设置
    target: 'es2020',
    minify: false, // 保持可读性便于调试
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});