# Registers the Market Watch with Windows Task Scheduler: every day at 07:00,
# and as soon as possible after a start the PC missed (asleep or off).
# Runs as the signed-in user, only while signed in — no password stored.
# Run once:  powershell -ExecutionPolicy Bypass -File scripts\watch\schedule.ps1
# Remove:    Unregister-ScheduledTask -TaskName "fynda Market Watch" -Confirm:$false

$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$action = New-ScheduledTaskAction -Execute "$PSScriptRoot\daily.cmd" -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -Daily -At 7:00
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName "fynda Market Watch" -Action $action -Trigger $trigger -Settings $settings `
  -Description "fynda.market: reads organisers' pages, re-confirms dates, asks Delfim in Telegram about changes (scripts/watch/run.mjs)" -Force | Out-Null
Get-ScheduledTask -TaskName "fynda Market Watch" | Select-Object TaskName, State
