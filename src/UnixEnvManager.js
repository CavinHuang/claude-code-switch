const fs = require('fs');
const os = require('os');
const path = require('path');

class UnixEnvManager {
  detectShellConfigFile() {
    const shell = process.env.SHELL || '';
    const homeDir = os.homedir();
    
    const configFiles = [];
    
    if (shell.includes('zsh')) {
      configFiles.push(path.join(homeDir, '.zshrc'));
      configFiles.push(path.join(homeDir, '.zshenv'));
    } else if (shell.includes('bash')) {
      configFiles.push(path.join(homeDir, '.bashrc'));
      configFiles.push(path.join(homeDir, '.bash_profile'));
    } else if (shell.includes('fish')) {
      configFiles.push(path.join(homeDir, '.config/fish/config.fish'));
    }
    
    configFiles.push(path.join(homeDir, '.profile'));
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        return file;
      }
    }
    
    return path.join(homeDir, '.profile');
  }
  
  setEnvVar(name, value) {
    const configFile = this.detectShellConfigFile();
    
    try {
      if (!fs.existsSync(configFile)) {
        const dir = path.dirname(configFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(configFile, '');
      }
      
      let content = fs.readFileSync(configFile, 'utf8');
      
      const exportRegex = new RegExp(`^export ${name}=.*$`, 'gm');
      const setRegex = new RegExp(`^set -gx ${name}.*$`, 'gm');
      content = content.replace(exportRegex, '').replace(setRegex, '');
      
      const isfish = configFile.includes('config.fish');
      const envLine = isfish 
        ? `set -gx ${name} "${value}"` 
        : `export ${name}="${value}"`;
      
      content = content.trim() + '\n' + envLine + '\n';
      
      fs.writeFileSync(configFile, content);
      
      return true;
    } catch (error) {
      console.error('Failed to set Unix environment variable:', error.message);
      return false;
    }
  }
  
  removeEnvVar(name) {
    const configFile = this.detectShellConfigFile();
    
    try {
      if (!fs.existsSync(configFile)) {
        return true;
      }
      
      let content = fs.readFileSync(configFile, 'utf8');
      
      const exportRegex = new RegExp(`^export ${name}=.*$`, 'gm');
      const setRegex = new RegExp(`^set -gx ${name}.*$`, 'gm');
      content = content.replace(exportRegex, '').replace(setRegex, '');
      
      fs.writeFileSync(configFile, content);
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

module.exports = UnixEnvManager;