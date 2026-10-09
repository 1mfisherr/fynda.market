@echo off
rem The Market Watch, as Windows starts it at every login (scripts/watch/schedule.ps1).
rem First the pages of any market added since last time (quick, adds only), then the
rem run itself, which goes ahead only when the last run is six days old (--if-due).
rem The last run's output stays in watch-data\last-run.log.
cd /d "%~dp0..\.."
if not exist watch-data mkdir watch-data
node scripts\watch\sources.mjs --apply > watch-data\last-run.log 2>&1
node scripts\watch\run.mjs --if-due >> watch-data\last-run.log 2>&1
