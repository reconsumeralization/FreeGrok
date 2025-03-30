@echo off
echo Setting up Popup Closer...

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Install required packages
echo Installing required packages...
pip install pyautogui pillow opencv-python

:: Create a directory for screenshots if it doesn't exist
if not exist "%~dp0debug_screenshots" mkdir "%~dp0debug_screenshots"

echo.
echo Setup complete!
echo.
echo ======================================================
echo To use the Popup Closer:
echo 1. Let the popup appear once
echo 2. Take a screenshot of just the close button
echo 3. Save it as 'close_button.png' in the scripts folder
echo ======================================================
echo.
echo Press any key to start the Popup Closer...
pause >nul

:: Run the popup closer script
python "%~dp0close_popup.py"

pause
