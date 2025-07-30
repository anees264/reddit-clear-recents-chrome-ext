# Quick Installation Guide

## Install the Extension

1. **Download/Clone** this repository to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right corner)
4. **Click "Load unpacked"** and select the folder containing this extension
5. **Done!** The extension should now appear in your extensions list

## Optional: Add Icons

1. Open `create_icons.html` in your browser
2. Click the download buttons for each icon size
3. Move the downloaded files to the extension folder
4. Refresh the extension in Chrome

## Usage

1. Go to any Reddit page (https://www.reddit.com)
2. Click the extension icon in your Chrome toolbar
3. Select subreddits you want to remove
4. Click "Clear Selected"
5. Both the page and extension will automatically reload to show the changes

## Troubleshooting

- Make sure you're on a Reddit page when using the extension
- The extension only works when opened while on Reddit.com
- If it doesn't work, try refreshing the Reddit page
- Check the browser console for any error messages

## Files Included

- `manifest.json` - Extension configuration
- `popup.html` & `popup.js` - Extension interface
- `content.js` - Reddit page interaction
- `background.js` - Extension background service
- `styles.css` - Interface styling
- `create_icons.html` - Icon generator tool
- `README.md` - Detailed documentation 
