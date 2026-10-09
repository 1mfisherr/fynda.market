@echo off
rem The Market Watch, as Windows starts it at every login (scripts/watch/schedule.ps1).
rem --if-due: it runs only when the last run is six days old or more, so once a week.
rem The last run's output stays in watch-data\last-run.log.
cd /d "%~dp0..\.."
if not exist watch-data mkdir watch-data
node scripts\watch\run.mjs --if-due > watch-data\last-run.log 2>&1
