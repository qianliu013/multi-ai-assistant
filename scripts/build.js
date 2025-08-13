#!/usr/bin/env node

/**
 * Chrome扩展构建脚本
 * 确保所有必要的文件都被正确构建和复制
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🚀 开始构建 Chrome 扩展...\n');

try {
  // 1. 运行类型检查
  console.log('📝 运行 TypeScript 类型检查...');
  execSync('pnpm run type-check', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ 类型检查通过\n');

  // 2. 运行 ESLint (暂时跳过)
  console.log('🔍 跳过 ESLint 检查 (配置中)...');

  // 3. 运行 Vite 构建
  console.log('🔨 构建项目...');
  execSync('vite build', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ 项目构建完成\n');

  // 4. 验证构建结果
  console.log('🔍 验证构建结果...');
  const distDir = resolve(projectRoot, 'dist');
  const requiredFiles = [
    'manifest.json',
    'popup.html',
    'popup.js',
    'background.js',
    'content.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png',
  ];

  const missingFiles = requiredFiles.filter(file => {
    const filePath = resolve(distDir, file);
    return !existsSync(filePath);
  });

  if (missingFiles.length > 0) {
    console.error('❌ 缺少必要文件:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }

  console.log('✅ 所有必要文件已生成\n');

  // 5. 显示构建结果
  console.log('📦 构建完成！文件列表:');
  function listFiles(dir, prefix = '') {
    const files = readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const fullPath = resolve(dir, file.name);
      const relativePath = prefix + file.name;
      
      if (file.isDirectory()) {
        console.log(`   📁 ${relativePath}/`);
        listFiles(fullPath, relativePath + '/');
      } else {
        console.log(`   📄 ${relativePath}`);
      }
    });
  }
  
  listFiles(distDir);
  
  console.log('\n🎉 Chrome扩展构建成功！');
  console.log('📍 构建文件位置:', distDir);
  console.log('\n💡 使用方法:');
  console.log('1. 打开 Chrome 浏览器');
  console.log('2. 进入 chrome://extensions/');
  console.log('3. 开启"开发者模式"');
  console.log('4. 点击"加载已解压的扩展程序"');
  console.log('5. 选择 dist 文件夹');

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}