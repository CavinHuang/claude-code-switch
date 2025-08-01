const { execSync } = require('child_process');

class WindowsEnvManager {
  constructor() {
  }
  setEnvVar(name, value) {
    try {
      // 使用 setx 设置永久环境变量
      execSync(`setx ${name} "${value}"`, { stdio: 'pipe' });
      
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
      // 使用 setx 删除永久环境变量（设置为空值）
      execSync(`setx ${name} ""`, { stdio: 'pipe' });
      
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
    
    return success;
  }
}

module.exports = WindowsEnvManager;