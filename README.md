# Reddit Clear Recents Chrome Extension

A Chrome extension to selectively remove subreddits from Reddit's recent communities sidebar. Removals persist across page reloads.

## Features

- **View Recent Subreddits**: See all recently visited subreddits with their icons and names
- **Selective Clearing**: Choose specific subreddits to remove
- **Select All**: Quickly select or deselect all items at once
- **Persistent Removals**: Removed subreddits stay hidden across page reloads and SPA navigation
- **Restore All**: Reset the removed list to bring everything back

## How It Works

The extension reads the recent communities section directly from Reddit's sidebar DOM (`#RECENT`). When you remove items, they are hidden immediately and the list is saved locally — on every subsequent page load, the extension automatically removes them again before they become visible.

## Permissions

- **activeTab**: To interact with the current Reddit tab
- **scripting**: To execute scripts on Reddit pages
- **storage**: To persist the list of removed subreddits locally across page reloads
- **Host permissions**: `https://www.reddit.com/*`

## Usage

1. Navigate to any Reddit page
2. Click the extension icon in your Chrome toolbar
3. Select the subreddits you want to remove
4. Click **Clear Selected**
5. To undo all removals, click **Restore all removed** at the bottom of the popup, then reload Reddit

## Load as Unpacked Extension (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top right corner
4. Click **Load unpacked** and select the extension folder

## Files

```
reddit-clear-recents-chrome-ext/
├── manifest.json       # Extension configuration
├── popup.html          # Popup interface
├── popup.js            # Popup logic
├── content.js          # Content script — applies removals on page load
├── background.js       # Background service worker
├── styles.css          # Popup styles
└── icons/              # Extension icons
```

## Troubleshooting

- **No subreddits shown**: Make sure you're on reddit.com and have visited some subreddits recently
- **Items reappearing**: If Reddit re-adds a subreddit (because you visited it), the extension will suppress it again on next render
- **Want items back**: Use the **Restore all removed** button in the popup, then reload the Reddit tab

## Privacy

- All data is stored locally in your browser via `chrome.storage.local`
- No data is sent to any external server
- Only runs on reddit.com pages

## License

Unlicense — see LICENSE for details.
