# Registers the Market Watch with Windows: it starts five minutes after each login
# (time for the internet to come up) and runs only if the last run is six days
# old or more — once a week, whenever Delfim's PC is on.
# Runs as the signed-in user, only while signed in — no password stored.
# Run once:  powershell -ExecutionPolicy Bypass -File scripts\watch\schedule.ps1
# Remove:    Unregister-ScheduledTask -TaskName "fynda Market Watch" -Confirm:$false

$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$action = New-ScheduledTaskAction -Execute "$PSScriptRoot\weekly.cmd" -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$trigger.Delay = 'PT5M'
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName "fynda Market Watch" -Action $action -Trigger $trigger -Settings $settings `
  -Description "fynda.market: once a week at login, reads organisers' pages, re-confirms dates, asks Delfim in Telegram about changes (scripts/watch/run.mjs)" -Force | Out-Null
Get-ScheduledTask -TaskName "fynda Market Watch" | Select-Object TaskName, State
