# RefreshEnv.ps1
#
# PowerShell script to read environment variables from registry and set session variables

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