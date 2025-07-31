#!/usr/bin/env node

const CCS = require('./CCS');

async function main() {
  const ccs = new CCS();
  const args = process.argv.slice(2);
  const command = args[0];
  
  // 处理输入流
  if (!process.stdin.isTTY) {
    process.stdin.setRawMode = false;
  }

  try {
    switch (command) {
      case 'list':
        await ccs.list();
        break;
      case 'current':
        await ccs.current();
        break;
      case 'add':
        await ccs.add(args[1], args[2], args[3]);
        break;
      case 'use':
        await ccs.use(args[1]);
        break;
      case 'remove':
      case 'rm':
        await ccs.remove(args[1]);
        break;
      case 'help':
      case '--help':
      case '-h':
        ccs.help();
        break;
      default:
        if (command) {
          console.log(`未知命令: ${command}`);
        }
        ccs.help();
        process.exit(1);
    }
  } catch (error) {
    console.error('执行命令时出错:', error.message);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = main;