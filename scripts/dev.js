#!/usr/bin/env node

/**
 * 开发模式脚本
 * 监听文件变化并重新构建
 */

import { execSync, spawn } from 'child_process';
import { watch } from 'chokidar';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🔥 启动开发模式...\n');

let buildProcess = null;

function runBuild() {
  if (buildProcess) {
    buildProcess.kill();
  }

  console.log('🔨 重新构建...');
  buildProcess = spawn('node', ['scripts/build.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  buildProcess.on('close', code => {
    if (code === 0) {
      console.log('✅ 构建完成，监听文件变化中...\n');
    } else {
      console.log('❌ 构建失败\n');
    }
  });
}

// 初始构建
runBuild();

// 监听文件变化
const watcher = watch(['src/**/*', 'public/**/*'], {
  ignored: ['node_modules', 'dist'],
  persistent: true,
});

watcher.on('change', path => {
  console.log(`📝 文件变化: ${path}`);
  runBuild();
});

watcher.on('add', path => {
  console.log(`➕ 新增文件: ${path}`);
  runBuild();
});

watcher.on('unlink', path => {
  console.log(`🗑️  删除文件: ${path}`);
  runBuild();
});

console.log('👀 正在监听文件变化...');
console.log('按 Ctrl+C 退出开发模式\n');

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 退出开发模式');
  if (buildProcess) {
    buildProcess.kill();
  }
  watcher.close();
  process.exit(0);
});
