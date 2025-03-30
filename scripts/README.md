# Development Tools

This directory contains utility scripts for development, database management, and automated tools.

## Database Tools

### Create Database
```bash
# Create the b2b_network database
npm run create-db
# or directly:
node scripts/create-db.js
```

### Supabase Setup
```bash
# Start local Supabase
npm run start-supabase
# or directly:
./scripts/start-supabase.sh
```

See `docs/SUPABASE_LOCAL.md` for more information about using local Supabase.

## Testing Tools

### System Test
```bash
# Test all components of the system
npm run test:all
# or directly:
node scripts/test-all.js
```

This will check:
- Docker status
- Database connection
- Supabase connection
- Next.js build
- Required dependencies
- Environment variables

### Fix Database Credentials

We've updated the system to use environment variables for database credentials instead of hardcoded values. Make sure to:

1. Set your database password in `.env.development`
2. Never commit sensitive credentials to version control
3. See `docs/SECURITY.md` for more security best practices

## Popup Closer Tool

### Setup and Test
```bash
# Install required dependencies
pip install pyautogui pillow opencv-python

# Test if popup closer is configured correctly
npm run test:popup-closer
# or directly:
python scripts/test-popup-closer.py
```

### Running the Popup Closer
```bash
# Start the popup closer (will run in the background)
npm run popup-closer
# or directly:
python scripts/close_popup.py
```

### How the Popup Closer Works

1. The tool uses image recognition to detect popup windows
2. It looks for a close button that matches `scripts/close_button.png`
3. When a match is found, it clicks the button to close the popup
4. Debug screenshots are saved to `scripts/debug_screenshots/`

To create your own close button template:
1. Take a screenshot of the popup window
2. Crop the image to just the close button
3. Save it as `scripts/close_button.png`

## Troubleshooting

If you encounter any issues:

1. **Database Connection Problems**: Check your `.env.development` file for correct credentials
2. **Supabase Not Starting**: Ensure Docker is running and ports 54321 and 8000 are available
3. **Popup Closer Not Working**: Run `python scripts/test-popup-closer.py` to diagnose issues
4. **Build Errors**: Fix syntax errors in the components we identified
