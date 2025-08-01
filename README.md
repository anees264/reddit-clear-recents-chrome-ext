# Reddit Clear Recents Chrome Extension

A Chrome extension that allows you to easily clear recent subreddits from Reddit's localStorage. This extension provides a clean interface to view and selectively remove subreddits from your recent browsing history.

## Features

- **View Recent Subreddits**: See all your recently visited subreddits with their icons and names
- **Selective Clearing**: Choose specific subreddits to remove from your recent list
- **Select All Option**: Quickly select or deselect all subreddits
- **Real-time Updates**: See changes immediately after clearing subreddits


## Load as Unpacked Extension - Development

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing this extension
5. The extension should now appear in your extensions list

## Usage

1. **Navigate to Reddit**: Go to any Reddit page (https://www.reddit.com)
2. **Open Extension**: Click the extension icon in your Chrome toolbar
3. **View Subreddits**: The popup will show all your recent subreddits
4. **Select Items**: Use checkboxes to select subreddits you want to remove
   - Use "Select All" to select/deselect all items
   - Individual checkboxes for specific subreddits
5. **Clear Selected**: Click "Clear Selected" to remove the chosen subreddits
6. **Page & Extension Reload**: Both the page and extension popup will automatically reload after clearing to reflect the changes
7. **Confirmation**: You'll see a success message confirming the action

## How It Works

The extension accesses Reddit's localStorage where recent subreddits are stored under the key `recent-subreddits-store`. It reads this data, displays it in a user-friendly interface, and allows you to selectively remove entries by their UUID.

### Data Structure

The extension works with Reddit's recent subreddits data structure:

```json
[
  {
    "communityIcon": "https://...",
    "displayNamePrefixed": "r/SubredditName",
    "headerImage": "https://...",
    "iconImage": "https://...",
    "keyColor": "#HEXCODE",
    "name": "t5_...",
    "url": "/r/SubredditName/",
    "uuid": "SubredditName"
  }
]
```

## Files Structure

```
reddit-clear-recents-chrome-ext/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── content.js            # Content script for Reddit pages
├── background.js         # Background service worker
├── styles.css            # Popup styling
├── README.md             # This file
└── LICENSE               # License file
```

## Permissions

The extension requires the following permissions:

- **activeTab**: To interact with the current Reddit tab
- **scripting**: To execute scripts in Reddit pages
- **tabs**: To reload the page after clearing subreddits
- **Host permissions**: Access to `https://www.reddit.com/*`

## Development

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debugging

- Open the extension popup and right-click to inspect
- Check the browser console for any errors
- Use Chrome DevTools to debug content scripts

## Troubleshooting

### Extension Not Working

1. **Check Reddit URL**: Make sure you're on a Reddit page (reddit.com)
2. **Extension Location**: The extension only works when opened while on Reddit.com
3. **Refresh Page**: Try refreshing the Reddit page
4. **Check Console**: Open browser console for error messages
5. **Reinstall Extension**: Try removing and re-adding the extension

### No Subreddits Found

- This usually means you haven't visited any subreddits recently
- Try visiting a few subreddits and then use the extension
- Check if you're logged into Reddit

### Clear Button Disabled

- Make sure you've selected at least one subreddit
- The button is only enabled when items are selected

## Privacy

This extension:
- Only accesses Reddit's localStorage data
- Does not send any data to external servers
- Only works on Reddit.com pages
- Requires no personal information

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## License

This project is licensed under the Unlicense License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the repository. 
