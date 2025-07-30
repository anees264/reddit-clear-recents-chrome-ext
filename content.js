// Content script for Reddit Clear Recents extension
// This script runs in the context of Reddit pages

(function() {
    'use strict';
    
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'getRecentSubreddits') {
            try {
                const recentSubredditsData = localStorage.getItem('recent-subreddits-store');
                if (recentSubredditsData) {
                    const subreddits = JSON.parse(recentSubredditsData);
                    sendResponse({ success: true, data: subreddits });
                } else {
                    sendResponse({ success: true, data: [] });
                }
            } catch (error) {
                console.error('Error reading recent subreddits:', error);
                sendResponse({ success: false, error: error.message });
            }
        } else if (request.action === 'removeSubreddits') {
            try {
                const recentSubredditsData = localStorage.getItem('recent-subreddits-store');
                if (!recentSubredditsData) {
                    sendResponse({ success: false, error: 'No recent subreddits found' });
                    return;
                }
                
                let currentSubreddits = JSON.parse(recentSubredditsData);
                const uuidsToRemove = request.subreddits.map(sr => sr.uuid);
                
                // Filter out the subreddits to remove
                currentSubreddits = currentSubreddits.filter(sr => !uuidsToRemove.includes(sr.uuid));
                
                // Save back to localStorage
                localStorage.setItem('recent-subreddits-store', JSON.stringify(currentSubreddits));
                
                sendResponse({ success: true, removedCount: uuidsToRemove.length });
            } catch (error) {
                console.error('Error removing subreddits:', error);
                sendResponse({ success: false, error: error.message });
            }
        }
        
        // Return true to indicate we will send a response asynchronously
        return true;
    });
    
    // Function to get recent subreddits (can be called from popup)
    window.getRecentSubreddits = function() {
        try {
            const recentSubredditsData = localStorage.getItem('recent-subreddits-store');
            if (recentSubredditsData) {
                return JSON.parse(recentSubredditsData);
            }
            return null;
        } catch (error) {
            console.error('Error reading recent subreddits:', error);
            return null;
        }
    };
    
    // Function to remove subreddits (can be called from popup)
    window.removeSubreddits = function(subredditsToRemove) {
        try {
            const recentSubredditsData = localStorage.getItem('recent-subreddits-store');
            if (!recentSubredditsData) return false;
            
            let currentSubreddits = JSON.parse(recentSubredditsData);
            
            // Remove subreddits by uuid
            const uuidsToRemove = subredditsToRemove.map(sr => sr.uuid);
            currentSubreddits = currentSubreddits.filter(sr => !uuidsToRemove.includes(sr.uuid));
            
            localStorage.setItem('recent-subreddits-store', JSON.stringify(currentSubreddits));
            return true;
        } catch (error) {
            console.error('Error removing subreddits:', error);
            return false;
        }
    };
    
    // Log that content script is loaded
    console.log('Reddit Clear Recents: Content script loaded');
})(); 
