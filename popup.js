document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const clearSelectedBtn = document.getElementById('clearSelected');
    const subredditsList = document.getElementById('subredditsList');
    const loading = document.getElementById('loading');
    const noSubreddits = document.getElementById('noSubreddits');
    const status = document.getElementById('status');
    
    let subreddits = [];
    let selectedSubreddits = new Set();
    
    // Initialize the popup
    loadSubreddits();
    
    // Event listeners
    selectAllCheckbox.addEventListener('change', handleSelectAll);
    clearSelectedBtn.addEventListener('click', handleClearSelected);
    
    function loadSubreddits() {
        // Get the active tab to communicate with content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            
            if (!activeTab.url) {
                showError('Unable to access current tab. Please navigate to Reddit.com to use this extension.');
                return;
            }
            
            if (!activeTab.url.includes('reddit.com')) {
                showError('Please navigate to Reddit.com to use this extension');
                return;
            }
            
            // Execute content script to get subreddits
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                function: getRecentSubreddits
            }, (results) => {
                if (chrome.runtime.lastError) {
                    showError('Please navigate to Reddit.com to use this extension');
                    return;
                }
                
                const result = results[0];
                if (result && result.result) {
                    subreddits = result.result;
                    displaySubreddits();
                } else {
                    showNoSubreddits();
                }
            });
        });
    }
    
    function getRecentSubreddits() {
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
    }
    
    function displaySubreddits() {
        loading.style.display = 'none';
        
        if (!subreddits || subreddits.length === 0) {
            showNoSubreddits();
            return;
        }
        
        subredditsList.innerHTML = '';
        subredditsList.style.display = 'block';
        
        subreddits.forEach((subreddit, index) => {
            const subredditItem = createSubredditItem(subreddit, index);
            subredditsList.appendChild(subredditItem);
        });
    }
    
    function createSubredditItem(subreddit, index) {
        const item = document.createElement('div');
        item.className = 'subreddit-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'subreddit-checkbox';
        checkbox.dataset.index = index;
        checkbox.addEventListener('change', handleSubredditSelection);
        
        const info = document.createElement('div');
        info.className = 'subreddit-info';
        
        const icon = document.createElement('div');
        icon.className = 'subreddit-icon';
        
        if (subreddit.communityIcon) {
            const img = document.createElement('img');
            img.src = subreddit.communityIcon;
            img.alt = subreddit.displayNamePrefixed;
            icon.appendChild(img);
        } else {
            icon.textContent = subreddit.displayNamePrefixed.charAt(2).toUpperCase();
        }
        
        const details = document.createElement('div');
        details.className = 'subreddit-details';
        
        const name = document.createElement('div');
        name.className = 'subreddit-name';
        name.textContent = subreddit.displayNamePrefixed;
        
        const url = document.createElement('div');
        url.className = 'subreddit-url';
        url.textContent = subreddit.url;
        
        details.appendChild(name);
        details.appendChild(url);
        info.appendChild(icon);
        info.appendChild(details);
        
        item.appendChild(checkbox);
        item.appendChild(info);
        
        return item;
    }
    
    function handleSubredditSelection(event) {
        const index = parseInt(event.target.dataset.index);
        
        if (event.target.checked) {
            selectedSubreddits.add(index);
        } else {
            selectedSubreddits.delete(index);
        }
        
        updateSelectAllState();
        updateClearButtonState();
    }
    
    function handleSelectAll() {
        const checkboxes = document.querySelectorAll('.subreddit-checkbox');
        
        if (selectAllCheckbox.checked) {
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = true;
                selectedSubreddits.add(index);
            });
        } else {
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = false;
                selectedSubreddits.delete(index);
            });
        }
        
        updateClearButtonState();
    }
    
    function updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.subreddit-checkbox');
        const checkedCount = selectedSubreddits.size;
        
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
    
    function updateClearButtonState() {
        clearSelectedBtn.disabled = selectedSubreddits.size === 0;
    }
    
    function handleClearSelected() {
        if (selectedSubreddits.size === 0) return;
        
        const selectedSubredditData = Array.from(selectedSubreddits).map(index => subreddits[index]);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            
            // Double-check we're on Reddit before proceeding
            if (!activeTab.url || !activeTab.url.includes('reddit.com')) {
                showError('Please navigate to Reddit.com to use this extension');
                return;
            }
            
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                function: removeSubreddits,
                args: [selectedSubredditData]
            }, (results) => {
                if (chrome.runtime.lastError) {
                    showError('Failed to clear selected subreddits');
                    return;
                }
                
                const result = results[0];
                if (result && result.result) {
                    showSuccess(`Successfully cleared ${selectedSubreddits.size} subreddit(s). Reloading page and extension...`);
                    
                    // Update badge count after clearing
                    chrome.runtime.sendMessage({ action: 'updateBadge' });
                    
                    // Reload both the Reddit page and the extension popup after a short delay
                    setTimeout(() => {
                        chrome.tabs.reload(activeTab.id);
                        // Reload the extension popup by closing and reopening it
                        window.location.reload();
                    }, 1500);
                } else {
                    showError('Failed to clear selected subreddits');
                }
            });
        });
    }
    
    function removeSubreddits(subredditsToRemove) {
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
    }
    
    function showNoSubreddits() {
        loading.style.display = 'none';
        subredditsList.style.display = 'none';
        noSubreddits.style.display = 'block';
    }
    
    function showSuccess(message) {
        status.textContent = message;
        status.className = 'status success';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
    
    function showError(message) {
        loading.style.display = 'none';
        subredditsList.style.display = 'none';
        noSubreddits.style.display = 'none';
        
        status.textContent = message;
        status.className = 'status error';
    }
}); 
