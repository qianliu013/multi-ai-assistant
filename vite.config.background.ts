import { defineConfig } from 'vite';
import { resolve } from 'path';

// 获取构建目标
const buildTarget = process.env.BUILD_TARGET || 'background';

// 专门为background和content脚本的构建配置
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // 不清空，因为popup已经构建了
    lib: {
      entry: resolve(__dirname, `src/${buildTarget}/${buildTarget}.ts`),
      formats: ['iife'],
      fileName: () => `${buildTarget}.js`,
      name: buildTarget === 'background' ? 'BackgroundScript' : 'ContentScript',
    },
    rollupOptions: {
      output: {
        // 内联所有依赖
        inlineDynamicImports: true,
      },
    },
    target: 'es2020',
    minify: false,
    sourcemap: true,
  },
});