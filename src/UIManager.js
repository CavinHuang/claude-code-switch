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