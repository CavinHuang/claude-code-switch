#!/usr/bin/env node

const { cac } = require('cac');
const CCS = require('./CCS');

async function main() {
  const cli = cac('ccs');
  const ccs = new CCS();
  
  // 处理输入流
  if (!process.stdin.isTTY) {
    process.stdin.setRawMode = false;
  }

  // 设置 CLI 基本信息
  cli
    .version(require('../package.json').version)
    .usage('<command> [options]')
    .help();

  cli
    .command('list', '列出所有已配置的厂商')
    .alias('ls')
    .action(async () => {
      try {
        await ccs.list();
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('current', '显示当前使用的厂商')
    .action(async () => {
      try {
        await ccs.current();
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('add [name] [baseUrl] [apiKey]', '添加新的厂商配置')
    .example('ccs add moonshot')
    .example('ccs add moonshot https://api.moonshot.cn/v1 sk-xxx')
    .action(async (name, baseUrl, apiKey) => {
      try {
        await ccs.add(name, baseUrl, apiKey);
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('use [name]', '切换到指定厂商')
    .example('ccs use anthropic')
    .example('ccs use moonshot')
    .action(async (name) => {
      try {
        await ccs.use(name);
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('remove [name]', '删除指定厂商配置')
    .alias('rm')
    .example('ccs remove moonshot')
    .action(async (name) => {
      try {
        await ccs.remove(name);
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('apply', '应用已保存的环境变量到当前会话')
    .example('ccs apply')
    .action(async () => {
      try {
        await ccs.apply();
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli
    .command('refresh', '从注册表刷新环境变量到当前会话')
    .example('ccs refresh')
    .action(async () => {
      try {
        await ccs.refresh();
      } catch (error) {
        console.error('执行命令时出错:', error.message);
        process.exit(1);
      }
    });

  cli.parse();
  
  // 如果没有提供任何命令或参数，显示帮助信息
  if (process.argv.length === 2) {
    cli.outputHelp();
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