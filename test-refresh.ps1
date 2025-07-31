Write-Host "=== 测试环境变量立即刷新机制 ===" -ForegroundColor Yellow

# 模拟 setx 设置一个新的环境变量
Write-Host "`n1. 使用 setx 设置新的测试环境变量..." -ForegroundColor Cyan
Start-Process -FilePath "setx" -ArgumentList "CCS_TEST_VAR", "test_value_123" -Wait -WindowStyle Hidden

# 检查当前会话中是否有这个变量
Write-Host "`n2. 检查当前会话中的测试变量:" -ForegroundColor Cyan
Write-Host "当前会话: $env:CCS_TEST_VAR"

# 从注册表读取
Write-Host "`n3. 从注册表读取测试变量:" -ForegroundColor Cyan
$regValue = [System.Environment]::GetEnvironmentVariable('CCS_TEST_VAR', 'User')
Write-Host "注册表值: $regValue"

# 定义刷新函数
function Update-SingleEnvironmentVariable {
    param($VariableName)
    
    $userValue = [System.Environment]::GetEnvironmentVariable($VariableName, 'User')
    $machineValue = [System.Environment]::GetEnvironmentVariable($VariableName, 'Machine')
    
    # 用户级变量优先于机器级变量
    $finalValue = if ($userValue) { $userValue } else { $machineValue }
    
    if ($finalValue) {
        Set-Item -Path "Env:\$VariableName" -Value $finalValue
        Write-Host "✓ 已刷新环境变量 $VariableName 到当前会话" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ 未找到环境变量 $VariableName" -ForegroundColor Red
        return $false
    }
}

# 4. 使用函数刷新变量到当前会话
Write-Host "`n4. 刷新测试变量到当前会话..." -ForegroundColor Green
$refreshed = Update-SingleEnvironmentVariable -VariableName "CCS_TEST_VAR"

# 5. 验证刷新结果
Write-Host "`n5. 验证刷新后的结果:" -ForegroundColor Cyan
Write-Host "刷新后当前会话: $env:CCS_TEST_VAR"

# 6. 测试多个变量的批量刷新
Write-Host "`n6. 测试批量刷新 ANTHROPIC 相关变量..." -ForegroundColor Green
$anthropicVars = @("ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY")

foreach ($varName in $anthropicVars) {
    Update-SingleEnvironmentVariable -VariableName $varName
}

Write-Host "`n=== 最终状态 ===" -ForegroundColor Yellow
Write-Host "CCS_TEST_VAR: $env:CCS_TEST_VAR"
Write-Host "ANTHROPIC_AUTH_TOKEN: $env:ANTHROPIC_AUTH_TOKEN"
Write-Host "ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"

# 清理测试变量
Write-Host "`n清理测试变量..." -ForegroundColor Gray
Start-Process -FilePath "setx" -ArgumentList "CCS_TEST_VAR", "" -Wait -WindowStyle Hidden
Remove-Item -Path "Env:\CCS_TEST_VAR" -ErrorAction SilentlyContinue