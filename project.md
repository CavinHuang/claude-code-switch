# 功能描述

这是一个用来切换 claude code 模型厂商的命令行工具，需要支持下面几个命令：

```bash
ccs list # 查看当前支持的厂商
ccs [name] # 查看某厂商具体的配置

# 添加 厂商
ccs add [name]
> 请输入符合 anthropic 规范的base url
> 请选择认证方式 auth/API key
> 请输入 token 或者 API key

ccs use [name] # 使用厂商
```

## claude code mac使用方式：

配置 Claude Code 环境变量
为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：

方法一：临时设置（当前会话）
在 Terminal 中运行以下命令：

export ANTHROPIC_BASE_URL="https://cc.mrhuang.site/api/"
export ANTHROPIC_AUTH_TOKEN="你的API密钥"
💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。

方法二：永久设置
编辑你的 shell 配置文件（根据你使用的 shell）：

# 对于 zsh (默认)
echo 'export ANTHROPIC_BASE_URL="https://cc.mrhuang.site/api/"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.zshrc
source ~/.zshrc
# 对于 bash
echo 'export ANTHROPIC_BASE_URL="https://cc.mrhuang.site/api/"' >> ~/.bash_profile
echo 'export ANTHROPIC_AUTH_TOKEN="你的API密钥"' >> ~/.bash_profile
source ~/.bash_profile


## claude code windows使用方式：

配置 Claude Code 环境变量
为了让 Claude Code 连接到你的中转服务，需要设置两个环境变量：

方法一：PowerShell 临时设置（推荐）
在 PowerShell 中运行以下命令：

$env:ANTHROPIC_BASE_URL = "https://cc.mrhuang.site/api/"
$env:ANTHROPIC_AUTH_TOKEN = "你的API密钥"
💡 记得将 "你的API密钥" 替换为在上方 "API Keys" 标签页中创建的实际密钥。

方法二：系统环境变量（永久设置）
右键"此电脑" → "属性" → "高级系统设置"
点击"环境变量"按钮
在"用户变量"或"系统变量"中点击"新建"
添加以下两个变量：
变量名： ANTHROPIC_BASE_URL
变量值： https://cc.mrhuang.site/api/
变量名： ANTHROPIC_AUTH_TOKEN
变量值： 你的API密钥
验证环境变量设置
设置完环境变量后，可以通过以下命令验证是否设置成功：