# Claude Code Switch (CCS)

一个用于管理和切换 Claude Code 模型厂商配置的命令行工具。

## 🌟 功能特性

- 🔄 **快速切换**: 一键切换不同的 Claude Code 厂商
- 📁 **配置管理**: 统一管理多个厂商配置
- 🔒 **安全存储**: 安全的 API 密钥本地存储
- 🌍 **跨平台**: 支持 Windows/macOS/Linux
- 🎨 **友好界面**: 彩色命令行界面和交互式提示
- ⚡ **环境变量**: 自动管理 Claude Code 所需的环境变量

## 📦 安装

### 方式一：全局安装（推荐）
```bash
npm install -g claude-code-switch
```

### 方式二：本地开发
```bash
git clone https://github.com/your-username/claude-code-switch.git
cd claude-code-switch
npm install
npm run global-install
```

## 🔧 Windows 用户前置设置

为了在 Windows 上无需重启终端即可应用环境变量更改，需要进行一次性设置：

### 1. 打开 PowerShell 配置文件
```powershell
# 检查配置文件是否存在
Test-Path $PROFILE

# 如果不存在，创建配置文件
if (!(Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# 打开配置文件进行编辑
notepad $PROFILE
```

### 2. 添加 source 函数
在配置文件中添加以下内容：
```powershell
# Claude Code Switch - Environment Refresh Function
function source {
    Write-Host "Refreshing cmd.exe environment variables from registry. Please wait..." -NoNewline

    function Set-FromReg {
        param (
            [string]$regPath,
            [string]$name,
            [string]$varName
        )
        $value = Get-ItemProperty -Path $regPath -Name $name -ErrorAction SilentlyContinue
        if ($value) {
            Set-Item -Path Env:$varName -Value $value.$name
        }
    }

    function Get-RegEnv {
        param (
            [string]$regPath
        )
        $vars = Get-Item -Path $regPath
        foreach ($var in $vars.Property) {
            if ($var -ne "Path") {
                Set-FromReg $regPath $var $var
            }
        }
    }

    # Get system and user environment variables
    Get-RegEnv "HKLM:\System\CurrentControlSet\Control\Session Manager\Environment"
    Get-RegEnv "HKCU:\Environment"

    # Special handling for PATH - combine user and system paths
    $path_HKLM = (Get-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Session Manager\Environment").Path
    $path_HKCU = (Get-ItemProperty -Path "HKCU:\Environment").Path
    $env:Path = "$path_HKLM;$path_HKCU"

    # Save original username and architecture
    $OriginalUserName = $env:USERNAME
    $OriginalArchitecture = $env:PROCESSOR_ARCHITECTURE

    # Reset username and architecture
    $env:USERNAME = $OriginalUserName
    $env:PROCESSOR_ARCHITECTURE = $OriginalArchitecture

    Write-Host "Done."
}
```

### 3. 重新加载配置文件
```powershell
# 重新加载 PowerShell 配置文件
. $PROFILE
```

### 4. 验证设置
```powershell
# 测试 source 命令是否可用
Get-Command source
```

完成以上设置后，每次使用 `ccs use` 切换厂商后，只需执行 `source` 命令即可立即应用环境变量更改，无需重启终端。

## 🚀 快速开始

### 1. 查看帮助信息
```bash
ccs help
```

### 2. 查看所有厂商
```bash
ccs list
```

### 3. 添加GLM-4.5厂商
```bash
ccs add glm45
# 按提示输入：
# Base URL: https://open.bigmodel.cn/api/anthropic
# API Key: 你的GLM API Key
```

### 4. 切换到GLM-4.5
```bash
ccs use glm45
```

### 5. 查看当前厂商
```bash
ccs current
```

## 📋 命令详解

| 命令 | 描述 | 示例 |
|------|------|------|
| `ccs list` | 列出所有配置的厂商 | `ccs list` |
| `ccs current` | 显示当前活跃厂商 | `ccs current` |
| `ccs add <name>` | 添加新厂商配置 | `ccs add glm45` |
| `ccs use <name>` | 切换到指定厂商 | `ccs use kimi` |
| `ccs remove <name>` | 删除厂商配置 | `ccs remove qwen` |
| `ccs help` | 显示帮助信息 | `ccs help` |

## 🏢 支持的厂商

### 内置厂商
- **anthropic**: Anthropic 官方 Claude API
  - 无需配置 Base URL
  - 直接使用官方端点

### 支持的厂商接入

#### 1. GLM-4.5（智谱AI）
- **获取API Key**: [https://bigmodel.cn/usercenter/proj-mgmt/apikeys](https://bigmodel.cn/usercenter/proj-mgmt/apikeys)
- **Base URL**: `https://open.bigmodel.cn/api/anthropic`
- **配置示例**:
  ```bash
  ccs add glm45
  # Base URL: https://open.bigmodel.cn/api/anthropic
  # API Key: 你的GLM API-key
  ```

#### 2. Kimi（月之暗面）
- **获取API Key**: [https://platform.moonshot.ai/](https://platform.moonshot.ai/)
- **Base URL**: `https://api.moonshot.ai/anthropic`
- **配置示例**:
  ```bash
  ccs add kimi
  # Base URL: https://api.moonshot.ai/anthropic
  # API Key: 你的Kimi API Key
  ```

#### 3. Qwen Coder（阿里云）
- **获取API Key**: [https://bailian.console.aliyun.com/](https://bailian.console.aliyun.com/)
- **Base URL**: `https://dashscope-intl.aliyuncs.com/api/v2/apps/claude-code-proxy`
- **配置示例**:
  ```bash
  ccs add qwen
  # Base URL: https://dashscope-intl.aliyuncs.com/api/v2/apps/claude-code-proxy
  # API Key: 你的DashScope API Key
  ```

#### 4. 自定义厂商
- 任何兼容 Anthropic API 规范的服务

## 📁 配置文件

### 配置文件位置
- **Windows**: `%USERPROFILE%\.claude\providers.json`
- **macOS/Linux**: `~/.claude/providers.json`

### 配置文件格式
```json
{
  "glm45": {
    "base_url": "https://open.bigmodel.cn/api/anthropic",
    "api_key": "your-glm-api-key"
  },
  "kimi": {
    "base_url": "https://api.moonshot.ai/anthropic",
    "api_key": "your-kimi-api-key"
  },
  "qwen": {
    "base_url": "https://dashscope-intl.aliyuncs.com/api/v2/apps/claude-code-proxy",
    "api_key": "your-dashscope-api-key"
  }
}
```

## 🔧 环境变量

工具会自动管理以下环境变量：
- `ANTHROPIC_BASE_URL`: API 端点地址
- `ANTHROPIC_AUTH_TOKEN`: API 密钥

### 环境变量生效
使用 `ccs use` 切换厂商后，工具会提示相应的刷新命令：

- **Windows**: 执行 `source` 命令（需要完成前置设置）
- **macOS/Linux**: 执行 `source ~/.bashrc` 或 `source ~/.zshrc`

这样无需重启终端即可立即应用环境变量更改。

## 💡 使用场景

### 开发调试
```bash
# 开发时使用国内兼容服务
ccs use glm45

# 生产环境切换到官方服务
ccs use anthropic
```

## 🔒 安全说明

- API 密钥存储在本地配置文件中
- 配置文件权限设置为仅用户可读写（Unix系统）
- 不会上传任何配置信息到网络
- 环境变量仅在本地生效

## 🛠️ 开发

### 本地开发设置
```bash
git clone https://github.com/your-username/claude-code-switch.git
cd claude-code-switch
npm install
npm run global-install
```

### 卸载
```bash
npm run global-uninstall
# 或者
npm unlink -g claude-code-switch
```

## 🐛 故障排除

### 1. 命令找不到
```bash
# 确保全局安装成功
npm list -g claude-code-switch

# 重新安装
npm uninstall -g claude-code-switch
npm install -g claude-code-switch
```

### 2. 环境变量不生效
```bash
# Windows: 执行 source 命令
source

# macOS/Linux: 重新加载配置
source ~/.bashrc  # 或 ~/.zshrc
```

### 3. 权限错误
```bash
# Windows: 以管理员身份运行
# macOS/Linux: 检查文件权限
ls -la ~/.claude/
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

**⭐ 如果这个工具对你有帮助，请给个 Star！**