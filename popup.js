document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const clearSelectedBtn = document.getElementById('clearSelected');
    const subredditsList = document.getElementById('subredditsList');
    const loading = document.getElementById('loading');
    const noSubreddits = document.getElementById('noSubreddits');
    const status = document.getElementById('status');
    const footer = document.getElementById('footer');
    const restoreAllBtn = document.getElementById('restoreAll');

    let subreddits = [];
    let selectedSubreddits = new Set();

    loadSubreddits();
    checkRestorable();

    selectAllCheckbox.addEventListener('change', handleSelectAll);
    clearSelectedBtn.addEventListener('click', handleClearSelected);
    restoreAllBtn.addEventListener('click', handleRestoreAll);

    function loadSubreddits() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];

            if (!activeTab.url || !activeTab.url.includes('reddit.com')) {
                showError('Please navigate to Reddit.com to use this extension');
                return;
            }

            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                function: getRecentSubreddits
            }, (results) => {
                if (chrome.runtime.lastError) {
                    showError('Please navigate to Reddit.com to use this extension');
                    return;
                }

                const result = results[0];
                if (result && result.result && result.result.length > 0) {
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
            const container = document.querySelector('#RECENT');
            if (!container) return null;

            const items = container.querySelectorAll('li[rpl]');
            if (!items.length) return null;

            return Array.from(items).map(li => {
                const a = li.querySelector('a[href]');
                const img = li.querySelector('img');
                const nameEl = li.querySelector('.truncate');
                return {
                    displayNamePrefixed: nameEl ? nameEl.textContent.trim() : '',
                    url: a ? a.getAttribute('href') : '',
                    communityIcon: img ? img.src : ''
                };
            }).filter(sr => sr.url);
        } catch (error) {
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
            subredditsList.appendChild(createSubredditItem(subreddit, index));
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

        details.appendChild(name);
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

        const urlsToRemove = Array.from(selectedSubreddits).map(index => subreddits[index].url);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];

            if (!activeTab.url || !activeTab.url.includes('reddit.com')) {
                showError('Please navigate to Reddit.com to use this extension');
                return;
            }

            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                function: removeSubreddits,
                args: [urlsToRemove]
            }, (results) => {
                if (chrome.runtime.lastError) {
                    showError('Failed to clear selected subreddits');
                    return;
                }

                const result = results[0];
                if (result && result.result) {
                    const count = selectedSubreddits.size;
                    chrome.storage.local.get(['removedSubreddits'], (data) => {
                        const existing = data.removedSubreddits || [];
                        const updated = [...new Set([...existing, ...urlsToRemove])];
                        chrome.storage.local.set({ removedSubreddits: updated }, () => {
                            showSuccess(`Cleared ${count} subreddit${count !== 1 ? 's' : ''}`);
                            chrome.runtime.sendMessage({ action: 'updateBadge' });
                            setTimeout(() => window.location.reload(), 1000);
                        });
                    });
                } else {
                    showError('Failed to clear selected subreddits');
                }
            });
        });
    }

    function removeSubreddits(urlsToRemove) {
        try {
            const container = document.querySelector('#RECENT');
            if (!container) return false;

            let removed = 0;
            container.querySelectorAll('li[rpl]').forEach(li => {
                const a = li.querySelector('a[href]');
                if (a && urlsToRemove.includes(a.getAttribute('href'))) {
                    li.remove();
                    removed++;
                }
            });
            return removed > 0;
        } catch (error) {
            return false;
        }
    }

    function checkRestorable() {
        chrome.storage.local.get(['removedSubreddits'], (data) => {
            if (data.removedSubreddits && data.removedSubreddits.length > 0) {
                footer.style.display = 'block';
            }
        });
    }

    function handleRestoreAll() {
        chrome.storage.local.set({ removedSubreddits: [] }, () => {
            footer.style.display = 'none';
            showSuccess('Restored. Reload Reddit to see them again.');
        });
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
