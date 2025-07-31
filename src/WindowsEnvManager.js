const { execSync } = require('child_process');
const path = require('path');

class WindowsEnvManager {
  constructor() {
    this.refreshEnvScript = path.join(__dirname, 'RefreshEnv.ps1');
  }
  setEnvVar(name, value) {
    try {
      // 方法1: 使用 setx 设置永久环境变量（兼容性最好）
      execSync(`setx ${name} "${value}"`, { stdio: 'pipe' });
      
      // 方法2: 尝试在当前 PowerShell 会话中立即应用更改
      try {
        // 检测是否在 PowerShell 环境中运行
        const isInPowerShell = process.env.PSMODULEPATH || process.env.PSExecutionPolicyPreference;
        
        if (isInPowerShell) {
          // 构建刷新命令 - 从注册表读取并设置到当前会话
          const safeValue = value.replace(/"/g, '""'); // 转义双引号
          const refreshCommand = `try { $regValue = [System.Environment]::GetEnvironmentVariable('${name}', 'User'); if ($regValue) { $env:${name} = $regValue; Write-Host '✓ ${name} 已在当前会话中生效' -ForegroundColor Green; } } catch { Write-Host 'Failed to refresh ${name}' -ForegroundColor Red }`;
          
          // 在当前 PowerShell 父进程中执行刷新
          execSync(`powershell -NoProfile -Command "${refreshCommand}"`, { 
            stdio: 'inherit',
            timeout: 5000 
          });
        }
      } catch (refreshError) {
        // 刷新失败时提供手动命令
        console.log(`\n💡 要在当前会话中立即生效，请运行:`);
        console.log(`   $env:${name} = [System.Environment]::GetEnvironmentVariable('${name}', 'User')`);
      }
      
      // 总是显示手动刷新提示，因为跨进程刷新可能不可靠
      console.log(`\n🔄 如需在当前会话立即生效，请复制运行:`);
      console.log(`   $env:${name}="${value}"`);
      console.log(`   或运行: . "${require('path').join(require('os').homedir(), '.ccs', 'apply-env.ps1')}"`);
      
      
      // 设置当前 Node.js 进程的环境变量
      process.env[name] = value;
      
      return true;
    } catch (error) {
      console.error('Failed to set Windows environment variable:', error.message);
      return false;
    }
  }
  
  removeEnvVar(name) {
    try {
      // 方法1: 使用 setx 删除永久环境变量（设置为空值）
      execSync(`setx ${name} ""`, { stdio: 'pipe' });
      
      // 方法2: 尝试在当前 PowerShell 会话中立即删除环境变量
      try {
        // 检测是否在 PowerShell 环境中运行
        const isInPowerShell = process.env.PSMODULEPATH || process.env.PSExecutionPolicyPreference;
        
        if (isInPowerShell) {
          // 构建删除命令
          const removeCommand = `try { Remove-Item 'Env:${name}' -ErrorAction SilentlyContinue; Write-Host '✓ ${name} 已从当前会话中移除' -ForegroundColor Yellow; } catch { }`;
          
          // 在当前 PowerShell 父进程中执行删除
          execSync(`powershell -NoProfile -Command "${removeCommand}"`, { 
            stdio: 'inherit',
            timeout: 5000 
          });
        }
      } catch (refreshError) {
        // 删除失败时提供手动命令
        console.log(`\n💡 要在当前 PowerShell 会话中立即移除，请运行:`);
        console.log(`   Remove-Item "Env:${name}" -ErrorAction SilentlyContinue`);
      }
      
      // 从当前 Node.js 进程删除
      delete process.env[name];
      
      return true;
    } catch (error) {
      return false;
    }
  }

  setMultipleEnvVars(vars) {
    let success = true;
    for (const [name, value] of Object.entries(vars)) {
      if (value === null || value === undefined) {
        success = success && this.removeEnvVar(name);
      } else {
        success = success && this.setEnvVar(name, value);
      }
    }
    
    // 使用 RefreshEnv.ps1 刷新所有环境变量
    this.refreshEnvironment();
    
    return success;
  }
  
  refreshEnvironment() {
    try {
      console.log('\n🔄 正在刷新环境变量...');
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${this.refreshEnvScript}"`, {
        stdio: 'inherit',
        timeout: 10000
      });
      console.log('✓ 环境变量已刷新到当前会话');
      return true;
    } catch (error) {
      console.warn('⚠️ 自动刷新失败，请手动运行:');
      console.warn(`   powershell -NoProfile -ExecutionPolicy Bypass -File "${this.refreshEnvScript}"`);
      return false;
    }
  }
}

module.exports = WindowsEnvManager;