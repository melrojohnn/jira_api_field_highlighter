
document.addEventListener('DOMContentLoaded', () => {
  const enablePlugin = document.getElementById('enablePlugin');
  const showNullFields = document.getElementById('showNullFields');
  const viewApiBtn = document.getElementById('viewApiBtn');

  chrome.storage.sync.get(['enabled', 'showNulls'], (data) => {
    enablePlugin.checked = data.enabled !== false;
    showNullFields.checked = data.showNulls === true;
  });

  enablePlugin.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enablePlugin.checked }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    });
  });

  showNullFields.addEventListener('change', () => {
    chrome.storage.sync.set({ showNulls: showNullFields.checked }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      });
    });
  });

  viewApiBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      // Aceita project keys com letras e números
      const match = currentUrl.match(/(https:\/\/[^/]+)\/browse\/([A-Z0-9]+-\d+)/);
      if (match) {
        const baseUrl = match[1];
        const issueKey = match[2];
        const apiUrl = `${baseUrl}/rest/api/3/issue/${issueKey}`;
        chrome.tabs.create({ url: apiUrl });
      } else {
        alert("Não foi possível identificar a issue na URL atual.");
      }
    });
  });
});
