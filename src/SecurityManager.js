const fs = require('fs');

class SecurityManager {
  setConfigPermissions(filePath) {
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(filePath, 0o600);
      } catch (error) {
        console.warn('无法设置文件权限:', error.message);
      }
    }
  }
  
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  validateInput(input, type = 'string') {
    if (typeof input !== 'string' || input.trim().length === 0) {
      return false;
    }
    
    if (type === 'provider_name') {
      return /^[a-zA-Z0-9\s\-_]+$/.test(input.trim());
    }
    
    if (type === 'api_key') {
      return input.trim().length >= 10;
    }
    
    return true;
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    return input.trim().replace(/[<>&"']/g, '');
  }

  validateProvider(provider) {
    const errors = [];
    
    if (!provider.base_url && provider.base_url !== '') {
      errors.push('Base URL is required');
    } else if (provider.base_url && !this.validateUrl(provider.base_url)) {
      errors.push('Invalid base URL format');
    }
    
    if (!provider.api_key) {
      errors.push('API key is required');
    } else if (!this.validateInput(provider.api_key, 'api_key')) {
      errors.push('API key must be at least 10 characters long');
    }
    
    return errors;
  }
}

module.exports = SecurityManager;