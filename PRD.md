# Claude Code Switch (CCS) 产品需求文档

## 1. 产品概述

### 1.1 产品名称
Claude Code Switch (简称 CCS)

### 1.2 产品定位
一个用于管理和切换 Claude Code 模型厂商配置的命令行工具，支持多厂商配置管理，简化用户在不同AI服务提供商之间的切换操作。

### 1.3 目标用户
- 使用 Claude Code 的开发者
- 需要在多个AI服务厂商间切换的用户
- 企业级用户，需要管理多套API配置

## 2. 核心功能需求

### 2.1 厂商配置管理

#### 2.1.1 查看功能
- **命令**: `ccs list`
- **功能**: 显示当前已配置的所有厂商列表
- **输出格式**:
  ```
  Available providers:
  * anthropic (active)
    openrouter
    custom-provider
  ```

#### 2.1.2 详情查看
- **命令**: `ccs [name]`
- **功能**: 显示指定厂商的详细配置信息
- **输出格式**:
  ```
  Provider: anthropic
  Base URL: https://api.anthropic.com
  Auth Type: API Key
  Status: Active
  ```

### 2.2 厂商添加功能

#### 2.2.1 添加命令
- **命令**: `ccs add [name]`
- **功能**: 添加新的厂商配置
- **交互流程**:
  1. 提示输入 Base URL（符合 Anthropic 规范）
  2. 选择认证方式（Auth/API Key）
  3. 输入对应的认证凭据

#### 2.2.2 配置验证
- 验证 Base URL 格式正确性
- 验证 API 连通性（可选）
- 验证认证凭据有效性

### 2.3 厂商切换功能

#### 2.3.1 切换命令
- **命令**: `ccs use [name]`
- **功能**: 切换到指定厂商配置
- **实现方式**: 自动设置环境变量
  - `ANTHROPIC_BASE_URL`
  - `ANTHROPIC_AUTH_TOKEN`

## 3. 技术规格

### 3.1 支持平台
- Windows (PowerShell/CMD)
- macOS (zsh/bash)
- Linux (bash)

### 3.2 配置存储
- 配置文件位置:
  - Windows: `%APPDATA%/ccs/config.json`
  - macOS/Linux: `~/.config/ccs/config.json`

### 3.3 配置文件格式
```json
{
  "active": "anthropic",
  "providers": {
    "anthropic": {
      "baseUrl": "https://api.anthropic.com",
      "authType": "api_key",
      "token": "encrypted_token_here"
    },
    "openrouter": {
      "baseUrl": "https://openrouter.ai/api/v1",
      "authType": "api_key", 
      "token": "encrypted_token_here"
    }
  }
}
```

### 3.4 安全要求
- API密钥加密存储
- 支持环境变量读取
- 配置文件权限保护

## 4. 用户体验设计

### 4.1 命令行界面
- 简洁的命令结构
- 清晰的提示信息
- 彩色输出支持
- 进度指示器

### 4.2 错误处理
- 友好的错误提示
- 详细的错误描述
- 建议修复方案

### 4.3 帮助系统
- `ccs --help` 显示完整帮助
- `ccs [command] --help` 显示命令帮助

## 5. 扩展功能（未来版本）

### 5.1 配置管理
- `ccs remove [name]` - 删除厂商配置
- `ccs edit [name]` - 编辑厂商配置
- `ccs export` - 导出配置
- `ccs import` - 导入配置

### 5.2 高级功能
- 配置备份与恢复
- 配置模板支持
- 批量操作支持
- 配置同步功能

## 6. 性能要求

### 6.1 响应时间
- 命令执行时间 < 1秒
- 配置切换时间 < 0.5秒

### 6.2 资源占用
- 内存占用 < 50MB
- 配置文件大小 < 1MB

## 7. 兼容性要求

### 7.1 Claude Code 版本
- 支持当前主流版本
- 向后兼容性保证

### 7.2 环境变量标准
- 遵循 Anthropic 官方环境变量规范
- 支持现有配置无缝迁移

## 8. 测试要求

### 8.1 功能测试
- 各命令功能完整性测试
- 配置文件读写测试
- 环境变量设置测试

### 8.2 兼容性测试
- 多平台兼容性测试
- 不同Shell环境测试
- Claude Code版本兼容性测试

## 9. 发布计划

### 9.1 MVP版本 (v1.0)
- 基础的增删查改功能
- 支持主流平台
- 基本的错误处理

### 9.2 增强版本 (v1.1)
- 配置验证功能
- 改进的用户体验
- 更多厂商预设模板

### 9.3 完整版本 (v2.0)
- 所有扩展功能
- 企业级特性
- 高级安全功能