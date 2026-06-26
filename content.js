// Content script for Reddit Clear Recents extension

(function() {
    'use strict';

    let removedUrls = [];
    let debounceTimer;

    function applyRemovals() {
        if (!removedUrls.length) return;
        const container = document.querySelector('#RECENT');
        if (!container) return;
        container.querySelectorAll('li[rpl]').forEach(li => {
            const a = li.querySelector('a[href]');
            if (a && removedUrls.includes(a.getAttribute('href'))) {
                li.remove();
            }
        });
    }

    // Load stored removals and apply immediately, then watch for re-renders
    chrome.storage.local.get(['removedSubreddits'], (data) => {
        removedUrls = data.removedSubreddits || [];
        applyRemovals();
    });

    // Keep in sync if popup updates storage while the page is open
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.removedSubreddits) {
            removedUrls = changes.removedSubreddits.newValue || [];
            applyRemovals();
        }
    });

    // Re-apply after Reddit re-renders the sidebar (SPA navigation, etc.)
    const observer = new MutationObserver(() => {
        if (!removedUrls.length) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyRemovals, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'getRecentSubreddits') {
            try {
                const container = document.querySelector('#RECENT');
                if (!container) {
                    sendResponse({ success: true, data: [] });
                    return true;
                }
                const items = container.querySelectorAll('li[rpl]');
                const subreddits = Array.from(items).map(li => {
                    const a = li.querySelector('a[href]');
                    const img = li.querySelector('img');
                    const nameEl = li.querySelector('.truncate');
                    return {
                        displayNamePrefixed: nameEl ? nameEl.textContent.trim() : '',
                        url: a ? a.getAttribute('href') : '',
                        communityIcon: img ? img.src : ''
                    };
                }).filter(sr => sr.url);
                sendResponse({ success: true, data: subreddits });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        } else if (request.action === 'removeSubreddits') {
            try {
                const container = document.querySelector('#RECENT');
                if (!container) {
                    sendResponse({ success: false, error: 'Recent section not found' });
                    return true;
                }
                const urlsToRemove = request.urls;
                let removed = 0;
                container.querySelectorAll('li[rpl]').forEach(li => {
                    const a = li.querySelector('a[href]');
                    if (a && urlsToRemove.includes(a.getAttribute('href'))) {
                        li.remove();
                        removed++;
                    }
                });
                sendResponse({ success: true, removedCount: removed });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }
        return true;
    });
})();
