Write-Host "Testing final CCS solution..." -ForegroundColor Yellow

# Check PowerShell environment detection
Write-Host "PowerShell environment variables:"
Write-Host "  PSMODULEPATH exists: $([bool]$env:PSMODULEPATH)"
Write-Host "  PSExecutionPolicyPreference exists: $([bool]$env:PSExecutionPolicyPreference)"

# Check if ccs executable exists
$ccsPath = "E:\projects\ai-projects\claude-code-switch\bin\ccs.js"
Write-Host "CCS executable path: $ccsPath"
Write-Host "CCS exists: $(Test-Path $ccsPath)"

# Check current environment variables
Write-Host "Current ANTHROPIC_AUTH_TOKEN: $env:ANTHROPIC_AUTH_TOKEN"
Write-Host "Current ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL"

Write-Host "Test setup complete. Ready to test ccs use command." -ForegroundColor Green