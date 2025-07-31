const chalk = require('chalk');

class UIManager {
  success(message) {
    console.log(chalk.green('✓'), message);
  }
  
  error(message) {
    console.log(chalk.red('✗'), message);
  }
  
  info(message) {
    console.log(chalk.blue('ℹ'), message);
  }
  
  warning(message) {
    console.log(chalk.yellow('⚠'), message);
  }

  progress(message) {
    console.log(chalk.cyan('→'), message);
  }
  
  displayProviders(providers, currentProvider = null) {
    console.log(chalk.bold('\nAvailable providers:'));
    
    providers.forEach(provider => {
      const [name, url] = provider.split(': ');
      const isActive = currentProvider && currentProvider.name === name;
      const indicator = isActive ? chalk.green('*') : ' ';
      const status = isActive ? chalk.green('(active)') : '';
      
      console.log(`${indicator} ${chalk.cyan(name)}: ${chalk.gray(url)} ${status}`);
    });
    console.log();
  }

  displayHelp() {
    console.log(chalk.bold('\nClaude Code Switch (CCS) - 切换 Claude Code 模型厂商\n'));
    
    console.log(chalk.bold('用法:'));
    console.log('  ccs <command> [options]\n');
    
    console.log(chalk.bold('命令:'));
    console.log(`  ${chalk.cyan('list')}                    列出所有配置的厂商`);
    console.log(`  ${chalk.cyan('current')}                 显示当前活跃厂商`);
    console.log(`  ${chalk.cyan('add')} <name>              添加新厂商配置`);
    console.log(`  ${chalk.cyan('use')} <name>              切换到指定厂商`);
    console.log(`  ${chalk.cyan('remove')} <name>           删除厂商配置`);
    console.log(`  ${chalk.cyan('help')}                    显示此帮助信息\n`);
    
    console.log(chalk.bold('示例:'));
    console.log(`  ${chalk.gray('ccs list                    # 查看所有厂商')}`);
    console.log(`  ${chalk.gray('ccs add moonshot            # 添加月之暗面厂商')}`);
    console.log(`  ${chalk.gray('ccs use anthropic           # 切换到 Anthropic 官方')}`);
    console.log(`  ${chalk.gray('ccs current                 # 查看当前厂商')}`);
  }

  prompt(message) {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(chalk.white(message + ' '), (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  async promptSecret(message) {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(chalk.white(message + ' '), (answer) => {
        rl.close();
        console.log(); // 换行
        resolve(answer.trim());
      });
      
      rl._writeToOutput = function(stringToWrite) {
        if (rl.stdoutMuted) {
          rl.output.write("*");
        } else {
          rl.output.write(stringToWrite);
        }
      };
      
      rl.stdoutMuted = true;
    });
  }
}

module.exports = UIManager;