const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.claude');
    this.providersFile = path.join(this.configDir, 'providers.json');
    this.ensureConfigDir();
  }
  
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }
  
  ensureProvidersFile() {
    if (!fs.existsSync(this.providersFile)) {
      fs.writeFileSync(this.providersFile, '{}', 'utf8');
    }
  }
  
  loadProviders() {
    this.ensureProvidersFile();
    try {
      const content = fs.readFileSync(this.providersFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('providers.json文件损坏，重新创建...');
      fs.writeFileSync(this.providersFile, '{}', 'utf8');
      return {};
    }
  }
  
  saveProviders(providers) {
    try {
      const content = JSON.stringify(providers, null, 2);
      fs.writeFileSync(this.providersFile, content, 'utf8');
      return true;
    } catch (error) {
      console.error('保存配置失败:', error.message);
      return false;
    }
  }
  
  addProvider(name, baseUrl, apiKey) {
    const providers = this.loadProviders();
    
    providers[name] = {
      base_url: baseUrl,
      api_key: apiKey
    };
    
    return this.saveProviders(providers);
  }
  
  getProvider(name) {
    const providers = this.loadProviders();
    
    // 处理内置Anthropic provider
    if (name === 'anthropic' || name === 'Anthropic') {
      return {
        base_url: '',
        api_key: ''
      };
    }
    
    if (!providers[name]) {
      throw new Error(`Provider '${name}' not found`);
    }
    
    return providers[name];
  }
  
  listProviders() {
    const providers = this.loadProviders();
    const result = ['anthropic: (使用官方API默认设置)'];
    
    Object.keys(providers).forEach(key => {
      result.push(`${key}: ${providers[key].base_url}`);
    });
    
    return result;
  }
  
  removeProvider(name) {
    if (name === 'anthropic' || name === 'Anthropic') {
      throw new Error('无法删除内置的Anthropic provider');
    }
    
    const providers = this.loadProviders();
    
    if (!providers[name]) {
      throw new Error(`Provider '${name}' not found`);
    }
    
    delete providers[name];
    return this.saveProviders(providers);
  }

  getCurrentProvider() {
    const baseUrl = process.env.ANTHROPIC_BASE_URL;
    const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
    
    if (!baseUrl && !apiKey) {
      return null;
    }
    
    if (!baseUrl) {
      return { name: 'anthropic', provider: { base_url: '', api_key: '' } };
    }
    
    // 尝试通过base_url匹配provider名称
    const providers = this.loadProviders();
    const providerName = Object.keys(providers).find(key => 
      providers[key].base_url === baseUrl
    );
    
    if (providerName) {
      return { name: providerName, provider: providers[providerName] };
    }
    
    return { name: 'Unknown', provider: { base_url: baseUrl, api_key: apiKey } };
  }

  // 获取当前环境变量中的provider信息（实时检测）
  getCurrentProviderFromEnv() {
    const baseUrl = process.env.ANTHROPIC_BASE_URL;
    const apiKey = process.env.ANTHROPIC_AUTH_TOKEN;
    
    // 检查setx设置的环境变量（Windows）
    if (process.platform === 'win32') {
      try {
        const { execSync } = require('child_process');
        const userEnvVars = execSync('reg query "HKEY_CURRENT_USER\\Environment"', { encoding: 'utf8' });
        
        // 提取BASE_URL
        const baseUrlMatch = userEnvVars.match(/ANTHROPIC_BASE_URL\s+REG_SZ\s+(.+)/);
        const detectedBaseUrl = baseUrlMatch ? baseUrlMatch[1].trim() : '';
        
        if (detectedBaseUrl) {
          const providers = this.loadProviders();
          const providerName = Object.keys(providers).find(key => 
            providers[key].base_url === detectedBaseUrl
          );
          
          if (providerName) {
            return { name: providerName, provider: providers[providerName] };
          }
          
          return { name: 'Unknown', provider: { base_url: detectedBaseUrl, api_key: '' } };
        }
      } catch (error) {
        // 忽略错误，使用默认检测
      }
    }
    
    return this.getCurrentProvider();
  }
}

module.exports = ConfigManager;