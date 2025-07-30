// Background service worker for Reddit Clear Recents extension

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('Reddit Clear Recents extension installed');
    } else if (details.reason === 'update') {
        console.log('Reddit Clear Recents extension updated');
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
    // This will open the popup automatically due to the manifest configuration
    console.log('Extension icon clicked');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getTabInfo') {
        // Get information about the current tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
                sendResponse({
                    success: true,
                    tab: tabs[0]
                });
            } else {
                sendResponse({
                    success: false,
                    error: 'No active tab found'
                });
            }
        });
        return true; // Indicate async response
    }
});

// Handle tab updates to check if we're on Reddit
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com')) {
        // Inject content script if needed
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content.js']
        }).catch(error => {
            console.log('Content script already injected or error:', error);
        });
    }
});

console.log('Reddit Clear Recents: Background service worker loaded'); 
