#!/usr/bin/env python3
"""
Test script for the popup closer
This script checks if all required dependencies are installed and properly configured
"""

import os
import sys
import importlib
import platform
from pathlib import Path

# ANSI colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title):
    """Print a section header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}==== {title} ===={Colors.ENDC}\n")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.GREEN}[SUCCESS]{Colors.ENDC} {message}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.RED}[ERROR]{Colors.ENDC} {message}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.WARNING}[WARNING]{Colors.ENDC} {message}")

def print_info(message):
    """Print an info message"""
    print(f"{Colors.CYAN}[INFO]{Colors.ENDC} {message}")

def check_python_version():
    """Check if Python version is adequate"""
    print_section("Checking Python Version")

    major = sys.version_info.major
    minor = sys.version_info.minor
    version = f"{major}.{minor}"

    if major < 3 or (major == 3 and minor < 6):
        print_error(f"Python version {version} is too old. Minimum required: 3.6")
        return False
    else:
        print_success(f"Python version {version} is adequate")
        return True

def check_dependencies():
    """Check if required packages are installed"""
    print_section("Checking Dependencies")

    required_packages = [
        "pyautogui",
        "PIL",  # Checking for PIL instead of pillow
        "cv2",  # Checking for cv2 instead of opencv-python
    ]

    all_installed = True

    for package in required_packages:
        try:
            if package == "PIL":
                # Try to import PIL.Image specifically
                importlib.import_module("PIL.Image")
                print_success(f"Package 'pillow' is installed")
            elif package == "cv2":
                # Try to import cv2 specifically
                importlib.import_module("cv2")
                print_success(f"Package 'opencv-python' is installed")
            else:
                importlib.import_module(package)
                print_success(f"Package '{package}' is installed")
        except ImportError:
            if package == "PIL":
                print_error(f"Package 'pillow' is NOT installed")
            elif package == "cv2":
                print_error(f"Package 'opencv-python' is NOT installed")
            else:
                print_error(f"Package '{package}' is NOT installed")
            all_installed = False

    if not all_installed:
        print_info("To install missing packages, run: pip install pyautogui pillow opencv-python")

    return all_installed

def check_popup_closer_script():
    """Check if popup closer script exists and is configured"""
    print_section("Checking Popup Closer Script")

    script_path = Path(__file__).parent / "close_popup.py"

    if not script_path.exists():
        print_error(f"Popup closer script not found at: {script_path}")
        return False

    print_success(f"Popup closer script found at: {script_path}")

    # Check if the close button image exists
    debug_dir = Path(__file__).parent / "debug_screenshots"
    close_button_path = Path(__file__).parent / "close_button.png"

    if not close_button_path.exists():
        print_warning(f"Close button image not found at: {close_button_path}")
        print_info("You'll need to create this image before running the popup closer")

        # Create debug directory if it doesn't exist
        if not debug_dir.exists():
            debug_dir.mkdir(exist_ok=True)
            print_info(f"Created debug screenshots directory at: {debug_dir}")
    else:
        print_success(f"Close button image found at: {close_button_path}")

    return True

def check_platform_compatibility():
    """Check if the current platform is compatible"""
    print_section("Checking Platform Compatibility")

    system = platform.system()

    if system == "Windows":
        print_success(f"Platform '{system}' is compatible")
        return True
    elif system in ["Linux", "Darwin"]:
        if system == "Linux":
            # Check if X server is running
            if not os.environ.get("DISPLAY"):
                print_error(f"X server is not running. PyAutoGUI requires a graphical environment")
                return False
        print_success(f"Platform '{system}' is compatible")
        return True
    else:
        print_error(f"Platform '{system}' might not be compatible with PyAutoGUI")
        return False

def main():
    """Main function"""
    print("\n🔍 Testing Popup Closer Configuration...\n")

    python_ok = check_python_version()
    deps_ok = check_dependencies()
    script_ok = check_popup_closer_script()
    platform_ok = check_platform_compatibility()

    # Calculate overall status
    success = python_ok and deps_ok and script_ok and platform_ok

    print_section("SUMMARY")
    print(f"Python:     {'✅' if python_ok else '❌'}")
    print(f"Dependencies: {'✅' if deps_ok else '❌'}")
    print(f"Script Setup: {'✅' if script_ok else '❌'}")
    print(f"Platform:    {'✅' if platform_ok else '❌'}")

    if success:
        print(f"\n{Colors.GREEN}✅ Popup closer configuration looks good!{Colors.ENDC}\n")
        print("To run the popup closer, use:")
        print("  python scripts/close_popup.py")
    else:
        print(f"\n{Colors.RED}❌ Some configuration checks failed. Please fix the issues above.{Colors.ENDC}\n")

    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
