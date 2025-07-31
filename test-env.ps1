Write-Host "=== 环境变量诊断测试 ===" -ForegroundColor Yellow

# 1. 检查当前会话的环境变量
Write-Host "`n当前会话中的 ANTHROPIC_AUTH_TOKEN:" -ForegroundColor Cyan
Write-Host $env:ANTHROPIC_AUTH_TOKEN

# 2. 检查注册表中的用户级环境变量
Write-Host "`n注册表中的用户级 ANTHROPIC_AUTH_TOKEN:" -ForegroundColor Cyan
$userVar = [System.Environment]::GetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'User')
Write-Host $userVar

# 3. 检查注册表中的机器级环境变量
Write-Host "`n注册表中的机器级 ANTHROPIC_AUTH_TOKEN:" -ForegroundColor Cyan
$machineVar = [System.Environment]::GetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'Machine')
Write-Host $machineVar

# 4. 尝试手动从注册表刷新到当前会话
Write-Host "`n尝试从注册表刷新到当前会话..." -ForegroundColor Green
if ($userVar) {
    $env:ANTHROPIC_AUTH_TOKEN = $userVar
    Write-Host "已从用户级注册表刷新"
} elseif ($machineVar) {
    $env:ANTHROPIC_AUTH_TOKEN = $machineVar
    Write-Host "已从机器级注册表刷新"
} else {
    Write-Host "注册表中未找到该环境变量"
}

# 5. 验证刷新后的结果
Write-Host "`n刷新后当前会话中的 ANTHROPIC_AUTH_TOKEN:" -ForegroundColor Cyan
Write-Host $env:ANTHROPIC_AUTH_TOKEN

# 6. 测试完整的环境变量刷新函数
Write-Host "`n测试完整环境刷新..." -ForegroundColor Green
function Update-Environment {
    Write-Host "从注册表重新加载环境变量..."
    
    # 从注册表获取所有环境变量
    $locations = @(
        'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment',
        'HKCU:\Environment'
    )
    
    $locations | ForEach-Object {
        $k = Get-Item $_ -ErrorAction SilentlyContinue
        if ($k) {
            $k.GetValueNames() | ForEach-Object {
                $name = $_
                $value = $k.GetValue($_)
                Set-Item -Path "Env:\$name" -Value $value -ErrorAction SilentlyContinue
                Write-Host "  更新: $name" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "环境变量刷新完成" -ForegroundColor Green
}

Update-Environment

Write-Host "`n最终测试 - ANTHROPIC_AUTH_TOKEN:" -ForegroundColor Yellow
Write-Host $env:ANTHROPIC_AUTH_TOKEN