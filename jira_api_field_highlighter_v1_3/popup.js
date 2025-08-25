document.addEventListener('DOMContentLoaded', () => {
  const enablePlugin = document.getElementById('enablePlugin');
  const showNullFields = document.getElementById('showNullFields');
  const viewApiBtn = document.getElementById('viewApiBtn');
  const showOnlyComments = document.getElementById('showOnlyComments');
  const showMainFields = document.getElementById('showMainFields');

  chrome.storage.sync.get(['enabled', 'showNulls', 'showOnlyComments', 'showMainFields'], (data) => {
    enablePlugin.checked = data.enabled !== false;
    showNullFields.checked = data.showNulls === true;
    showOnlyComments.checked = data.showOnlyComments === true;
    showMainFields.checked = data.showMainFields === true;
  });

  function handleOptionChange() {
    const config = {
      enabled: enablePlugin.checked,
      showNulls: showNullFields.checked,
      showOnlyComments: showOnlyComments.checked,
      showMainFields: showMainFields.checked,
    };

    chrome.storage.sync.set(config, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          // Envia uma mensagem para o content script em vez de recarregar
          chrome.tabs.sendMessage(tabs[0].id, { action: "rerunHighlighter" });
        }
      });
    });
  }

  enablePlugin.addEventListener('change', handleOptionChange);
  showNullFields.addEventListener('change', handleOptionChange);
  showOnlyComments.addEventListener('change', handleOptionChange);
  showMainFields.addEventListener('change', handleOptionChange);

  viewApiBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const match = currentUrl.match(/(https:\/\/[^/]+)\/browse\/([A-Z]+-\d+)/);
      if (match) {
        const baseUrl = match[1];
        const issueKey = match[2];
        const apiUrl = `${baseUrl}/rest/api/3/issue/${issueKey}`;
        chrome.tabs.create({ url: apiUrl });
      } else {
        alert("Could not identify the issue from the current URL.");
      }
    });
  });
});
