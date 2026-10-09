@echo off
rem The Market Watch's daily run, as Windows Task Scheduler starts it (scripts/watch/schedule.ps1).
rem The last run's output stays in watch-data\last-run.log.
cd /d "%~dp0..\.."
if not exist watch-data mkdir watch-data
node scripts\watch\run.mjs > watch-data\last-run.log 2>&1
