Write-Host "=== 测试最终的 CCS 环境变量刷新方案 ===" -ForegroundColor Yellow

# 记录当前的环境变量值
Write-Host "`n1. 记录测试前的状态:" -ForegroundColor Cyan
$beforeToken = $env:ANTHROPIC_AUTH_TOKEN
$beforeBaseUrl = $env:ANTHROPIC_BASE_URL
Write-Host "   ANTHROPIC_AUTH_TOKEN: $beforeToken"
Write-Host "   ANTHROPIC_BASE_URL: $beforeBaseUrl"

# 模拟运行 ccs use 命令
Write-Host "`n2. 模拟运行 ccs use 命令..." -ForegroundColor Green
Write-Host "   (这会调用我们更新后的 WindowsEnvManager)"

# 实际测试 - 我们需要确保项目已构建
$ccsPath = "E:\projects\ai-projects\claude-code-switch\bin\ccs.js"
if (Test-Path $ccsPath) {
    Write-Host "   找到 ccs 可执行文件，开始测试..."
    
    # 运行 ccs list 来查看当前可用的厂商
    Write-Host "`n3. 查看可用厂商:" -ForegroundColor Cyan
    node $ccsPath list
    
    Write-Host "`n4. 测试环境变量刷新机制..." -ForegroundColor Green
    Write-Host "   注意观察是否出现 '✓ 已在当前会话中生效' 的消息"
    
    # 这里可以运行具体的 ccs use 命令来测试
    # node $ccsPath use [provider_name]
    
} else {
    Write-Host "   未找到 ccs 可执行文件，请先构建项目" -ForegroundColor Red
    Write-Host "   路径: $ccsPath"
}

# 验证环境变量检测逻辑
Write-Host "`n5. 验证 PowerShell 环境检测:" -ForegroundColor Cyan
Write-Host "   PSMODULEPATH 存在: $([bool]$env:PSMODULEPATH)"
Write-Host "   PSExecutionPolicyPreference 存在: $([bool]$env:PSExecutionPolicyPreference)"
Write-Host "   应该能检测到 PowerShell 环境: $([bool]($env:PSMODULEPATH -or $env:PSExecutionPolicyPreference))"

Write-Host "测试完成" -ForegroundColor Yellow