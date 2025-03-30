#!/usr/bin/env python3
"""
Popup Closer - Automatically closes annoying popups
Run this script in the background while working with Cursor

Requirements:
- pip install pyautogui pillow opencv-python
"""

import os
import time
import pyautogui
import logging
from datetime import datetime
import glob # Import glob for finding files

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'popup_closer.log'),
    filemode='a'
)

# Configuration
SCAN_INTERVAL = 30  # seconds between scans
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEBUG_DIR = os.path.join(SCRIPT_DIR, 'debug_screenshots')
CLOSE_BUTTON_IMAGES = [
    os.path.join(SCRIPT_DIR, 'close_button.png'),
    os.path.join(SCRIPT_DIR, 'close_add.png'),
    os.path.join(SCRIPT_DIR, 'badspam.png'),
    # Add additional close button images as needed
]

# Function to capture and save the current screen for debugging
def capture_screen_for_debugging():
    os.makedirs(DEBUG_DIR, exist_ok=True)
    screenshot = pyautogui.screenshot()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(DEBUG_DIR, f"screen_{timestamp}.png")
    screenshot.save(screenshot_path)
    logging.info(f"Saved debug screenshot to {screenshot_path}")
    return screenshot_path

# Function to clear the debug screenshots directory
def clear_debug_screenshots():
    if not os.path.isdir(DEBUG_DIR):
        return # Directory doesn't exist, nothing to clear

    files = glob.glob(os.path.join(DEBUG_DIR, '*.png')) # Find all png files
    if not files:
        return # No screenshots to delete

    logging.info(f"Clearing {len(files)} debug screenshots from {DEBUG_DIR} as no popups were detected in the last scan.")
    deleted_count = 0
    error_count = 0
    for f in files:
        try:
            os.remove(f)
            deleted_count += 1
        except OSError as e:
            logging.error(f"Error deleting screenshot {f}: {e}")
            error_count += 1
    if error_count > 0:
         logging.warning(f"Could not delete {error_count} screenshot files.")
    if deleted_count > 0:
        print(f"Cleared {deleted_count} debug screenshots.")


# Main function to monitor and close popups
def close_popups():
    logging.info("Popup Closer started")
    print("Popup Closer is running in the background...")
    print(f"Scanning for popups every {SCAN_INTERVAL} seconds.")
    print("Debug screenshots will be cleared if no popups are found during a scan.")
    print("Press Ctrl+C to stop")

    # Create a folder for the screenshots if it doesn't exist
    os.makedirs(DEBUG_DIR, exist_ok=True)

    # Check if at least one close button image exists
    found_any_image = False
    for img_path in CLOSE_BUTTON_IMAGES:
        if os.path.exists(img_path):
            found_any_image = True
            break

    if not found_any_image:
        logging.warning("No close button images found in the script directory.")
        print("Warning: No close button images found.")
        print(f"Please ensure at least one of the following files exists in {SCRIPT_DIR}:")
        for img_path in CLOSE_BUTTON_IMAGES:
            print(f"- {os.path.basename(img_path)}")
        print("Capturing initial screen for debugging...")
        capture_screen_for_debugging()
        input("Press Enter to continue after ensuring at least one image exists...")


    try:
        while True:
            found_and_closed = False
            try:
                # Check for any close buttons on screen
                for close_button_image in CLOSE_BUTTON_IMAGES:
                    if os.path.exists(close_button_image):
                        try:
                            # Confidence parameter allows for slight variations
                            # Use grayscale for potentially better performance/accuracy
                            close_button_location = pyautogui.locateOnScreen(
                                close_button_image,
                                confidence=0.8, # Increased confidence slightly, adjust if needed
                                grayscale=True
                            )

                            if close_button_location:
                                # Get center of the button
                                x, y = pyautogui.center(close_button_location)

                                # Click the close button
                                current_pos = pyautogui.position()
                                pyautogui.click(x, y)
                                pyautogui.moveTo(current_pos)  # Move mouse back to original position

                                logging.info(f"Closed popup using '{os.path.basename(close_button_image)}' at position {x}, {y}")
                                print(f"Closed popup using '{os.path.basename(close_button_image)}' at position {x}, {y}")

                                # Small delay after closing
                                time.sleep(0.5)
                                found_and_closed = True
                                break # Exit inner loop once a popup is closed in this scan cycle
                        except pyautogui.ImageNotFoundException:
                            # This specific image wasn't found, continue to the next image
                            continue
                        except Exception as find_err:
                             # Log errors during locateOnScreen specifically
                             logging.error(f"Error locating image '{os.path.basename(close_button_image)}': {str(find_err)}")
                             # Capture screen on locate error for debugging
                             capture_screen_for_debugging()


            except Exception as e:
                logging.error(f"Error during detection loop: {str(e)}")
                # Capture a debug screenshot when an unexpected error occurs
                capture_screen_for_debugging()

            # Wait before next scan only if nothing was closed in this cycle
            if not found_and_closed:
                # Clear screenshots if no popups were found in this scan cycle
                clear_debug_screenshots()
                time.sleep(SCAN_INTERVAL)
            # If something was closed, immediately scan again after the short post-click delay

    except KeyboardInterrupt:
        logging.info("Popup Closer stopped by user")
        print("\nPopup Closer stopped")

if __name__ == "__main__":
    close_popups()
