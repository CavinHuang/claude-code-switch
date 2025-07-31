Write-Host "Testing environment variable refresh mechanism" -ForegroundColor Yellow

# Set a test variable using setx
Write-Host "Setting test variable using setx..."
setx CCS_TEST_VAR "test_value_123" | Out-Null

# Check current session
Write-Host "Current session value: $env:CCS_TEST_VAR"

# Get from registry
$regValue = [System.Environment]::GetEnvironmentVariable('CCS_TEST_VAR', 'User')
Write-Host "Registry value: $regValue"

# Refresh to current session
$env:CCS_TEST_VAR = $regValue
Write-Host "After refresh: $env:CCS_TEST_VAR"

# Test the refresh function for ANTHROPIC vars
Write-Host "`nTesting ANTHROPIC variable refresh..."
$userToken = [System.Environment]::GetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'User')
Write-Host "ANTHROPIC_AUTH_TOKEN from registry: $userToken"

$env:ANTHROPIC_AUTH_TOKEN = $userToken
Write-Host "ANTHROPIC_AUTH_TOKEN after refresh: $env:ANTHROPIC_AUTH_TOKEN"

# Cleanup
setx CCS_TEST_VAR "" | Out-Null
Write-Host "Test completed"