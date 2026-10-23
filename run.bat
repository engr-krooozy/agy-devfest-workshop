@echo off
setlocal

:: Find Python executable (python, py, or python3)
set "PY_CMD="
where python >nul 2>nul && set "PY_CMD=python"
if not defined PY_CMD (
    where py >nul 2>nul && set "PY_CMD=py"
)
if not defined PY_CMD (
    where python3 >nul 2>nul && set "PY_CMD=python3"
)

if "%~1"=="" goto :help
if /i "%~1"=="serve" goto :serve
if /i "%~1"=="open" goto :open
if /i "%~1"=="test" goto :test
if /i "%~1"=="bugs" goto :bugs
if /i "%~1"=="reset" goto :reset
if /i "%~1"=="steps" goto :steps
if /i "%~1"=="preflight" goto :preflight
if /i "%~1"=="follow" goto :follow
goto :help

:check_py
if not defined PY_CMD (
    echo [FAIL] Python 3 is not installed or not in PATH.
    exit /b 1
)
exit /b 0

:serve
call :check_py || exit /b 1
%PY_CMD% serve.py
exit /b %ERRORLEVEL%

:open
start http://localhost:8000
exit /b 0

:test
call :check_py || exit /b 1
%PY_CMD% -m unittest discover -s tests -v
exit /b %ERRORLEVEL%

:bugs
call :check_py || exit /b 1
%PY_CMD% -m unittest discover -s bugs -v
exit /b %ERRORLEVEL%

:reset
git reset --hard demo-start
git clean -fdq
echo Reset to demo-start. The browser will reload by itself.
exit /b 0

:steps
if "%~2"=="" (
    echo Workshop steps ^(git tags^):
    for /f "delims=" %%t in ('git tag --list "step-*" --sort=version:refname') do (
        echo   %%t
    )
    echo.
    echo Usage: run steps 1              ^(show the diff for step 1^)
    echo        git checkout step-1-dark-mode
    exit /b 0
)
for /f "delims=" %%t in ('git tag --list "step-%~2-*"') do (
    git show --stat --patch "%%t"
    exit /b 0
)
echo No step-%~2-* tag found. Run "run steps" to list steps.
exit /b 1

:preflight
echo workshop preflight (Windows)
where agy >nul 2>nul && (echo   [OK]   agy installed) || (echo   [FAIL] agy not found)
if defined PY_CMD (
    echo   [OK]   Python found ^(%PY_CMD%^)
) else (
    echo   [FAIL] Python missing
)
git rev-parse demo-start >nul 2>nul && (echo   [OK]   tag demo-start exists) || (echo   [FAIL] tag demo-start missing)
if defined PY_CMD (
    %PY_CMD% -m unittest discover -s tests >nul 2>nul && (echo   [OK]   tests/ pass) || (echo   [FAIL] tests/ failed)
)
echo.
echo Run "run serve" ^(or "python serve.py"^) and open http://localhost:8000
exit /b 0

:follow
:loop
cls
echo   live changes   %TIME%
echo.
git status --short
echo.
git diff --stat
timeout /t 2 >nul
goto :loop

:help
echo Usage: run ^<command^>
echo.
echo Commands:
echo   run serve       Start the site with live reload on http://localhost:8000
echo   run open        Open http://localhost:8000 in your default browser
echo   run test        Run unit tests in tests/
echo   run bugs        Run bug report tests in bugs/
echo   run steps [N]   List workshop steps or view diff for step N
echo   run reset       Reset working tree back to demo-start
echo   run preflight   Check workshop prerequisites on Windows
echo   run follow      Watch live file changes in the working tree
exit /b 0
