const ConfigManager = require('./ConfigManager');
const WindowsEnvManager = require('./WindowsEnvManager');
const UnixEnvManager = require('./UnixEnvManager');
const SecurityManager = require('./SecurityManager');
const UIManager = require('./UIManager');

class CCS {
  constructor() {
    this.configManager = new ConfigManager();
    this.envManager = process.platform === 'win32' 
      ? new WindowsEnvManager() 
      : new UnixEnvManager();
    this.ui = new UIManager();
    this.security = new SecurityManager();
  }
  
  async list() {
    try {
      const providers = this.configManager.listProviders();
      const currentProvider = this.configManager.getCurrentProvider();
      
      this.ui.displayProviders(providers, currentProvider);
    } catch (error) {
      this.ui.error(`列出厂商失败: ${error.message}`);
    }
  }
  
  async add(name, baseUrl, apiKey) {
    try {
      if (!name) {
        name = await this.ui.prompt('请输入厂商名称:');
      }
      
      if (!this.security.validateInput(name, 'provider_name')) {
        throw new Error('厂商名称格式无效，只允许字母、数字、空格、横线、下划线');
      }

      if (!baseUrl) {
        baseUrl = await this.ui.prompt('请输入符合 Anthropic 规范的 Base URL:');
      }
      
      if (baseUrl && !this.security.validateUrl(baseUrl)) {
        throw new Error('Base URL 格式无效');
      }
      
      if (!apiKey) {
        apiKey = await this.ui.promptSecret('请输入 API Key:');
      }
      
      if (!this.security.validateInput(apiKey, 'api_key')) {
        throw new Error('API Key 格式无效，至少需要10个字符');
      }
      
      const errors = this.security.validateProvider({ base_url: baseUrl, api_key: apiKey });
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      if (this.configManager.addProvider(name, baseUrl, apiKey)) {
        this.ui.success(`厂商 '${name}' 添加成功`);
        
        const useNow = await this.ui.prompt('是否立即切换到此厂商? (y/N):');
        if (useNow.toLowerCase() === 'y' || useNow.toLowerCase() === 'yes') {
          await this.use(name);
        }
      } else {
        throw new Error('保存配置失败');
      }
    } catch (error) {
      this.ui.error(`添加厂商失败: ${error.message}`);
    }
  }
  
  async use(name) {
    try {
      if (!name) {
        name = await this.ui.prompt('请输入要切换的厂商名称:');
      }
      
      const provider = this.configManager.getProvider(name);
      
      const envVars = {};
      
      if (provider.base_url) {
        envVars['ANTHROPIC_BASE_URL'] = provider.base_url;
      } else {
        envVars['ANTHROPIC_BASE_URL'] = null; // 移除环境变量
      }
      
      if (provider.api_key) {
        envVars['ANTHROPIC_API_KEY'] = provider.api_key;
      }
      
      const success = this.envManager.setMultipleEnvVars(envVars);
      
      if (success) {
        this.ui.success(`已切换到厂商: ${name}`);
        if (process.platform === 'win32') {
          this.ui.info('请重启终端使更改生效');
        } else {
          const configFile = this.envManager.detectShellConfigFile();
          this.ui.info(`请执行 'source ${configFile}' 或重启终端使更改生效`);
        }
      } else {
        throw new Error('设置环境变量失败');
      }
    } catch (error) {
      this.ui.error(`切换厂商失败: ${error.message}`);
    }
  }
  
  async current() {
    try {
      const currentProvider = this.configManager.getCurrentProviderFromEnv();
      
      if (!currentProvider) {
        this.ui.info('当前未设置任何厂商');
        return;
      }
      
      if (currentProvider.name === 'anthropic') {
        this.ui.info('当前厂商: Anthropic (使用官方API默认设置)');
      } else {
        this.ui.info(`当前厂商: ${currentProvider.name} (${currentProvider.provider.base_url})`);
      }
    } catch (error) {
      this.ui.error(`获取当前厂商失败: ${error.message}`);
    }
  }

  async remove(name) {
    try {
      if (!name) {
        name = await this.ui.prompt('请输入要删除的厂商名称:');
      }
      
      const confirm = await this.ui.prompt(`确定要删除厂商 '${name}' 吗? (y/N):`);
      if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
        this.ui.info('取消删除操作');
        return;
      }
      
      if (this.configManager.removeProvider(name)) {
        this.ui.success(`厂商 '${name}' 删除成功`);
      } else {
        throw new Error('删除配置失败');
      }
    } catch (error) {
      this.ui.error(`删除厂商失败: ${error.message}`);
    }
  }

  help() {
    this.ui.displayHelp();
  }
}

module.exports = CCS;