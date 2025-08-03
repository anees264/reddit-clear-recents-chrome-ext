// Background service worker for Reddit Clear Recents extension

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        console.log('Reddit Clear Recents extension installed');
        // Clear badge on install
        chrome.action.setBadgeText({ text: '' });
    } else if (details.reason === 'update') {
        console.log('Reddit Clear Recents extension updated');
    }
});

// Function to update badge with subreddit count
async function updateBadgeCount(tabId) {
    try {
        // Execute script to get subreddit count
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                try {
                    const recentSubredditsData = localStorage.getItem('recent-subreddits-store');
                    if (recentSubredditsData) {
                        const subreddits = JSON.parse(recentSubredditsData);
                        return subreddits.length;
                    }
                    return 0;
                } catch (error) {
                    console.error('Error reading recent subreddits:', error);
                    return 0;
                }
            }
        });
        
        const count = results[0].result;
        
        if (count > 0) {
            // Show count as badge text
            chrome.action.setBadgeText({ 
                text: count.toString(),
                tabId: tabId 
            });
            // Set badge background color
            chrome.action.setBadgeBackgroundColor({ 
                color: '#FF4500', // Reddit orange
                tabId: tabId 
            });
        } else {
            // Clear badge if no subreddits
            chrome.action.setBadgeText({ 
                text: '',
                tabId: tabId 
            });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
        // Clear badge on error
        chrome.action.setBadgeText({ 
            text: '',
            tabId: tabId 
        });
    }
}

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
    } else if (request.action === 'updateBadge') {
        // Update badge after clearing subreddits
        if (sender.tab) {
            updateBadgeCount(sender.tab.id);
        }
        sendResponse({ success: true });
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
        
        // Update badge count for Reddit pages
        updateBadgeCount(tabId);
    } else if (changeInfo.status === 'complete') {
        // Clear badge for non-Reddit pages
        chrome.action.setBadgeText({ 
            text: '',
            tabId: tabId 
        });
    }
});

// Handle tab activation to update badge
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url && tab.url.includes('reddit.com')) {
            updateBadgeCount(tab.id);
        } else {
            chrome.action.setBadgeText({ 
                text: '',
                tabId: tab.id 
            });
        }
    });
});

console.log('Reddit Clear Recents: Background service worker loaded'); 
