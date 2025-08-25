
(function () {
  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function highlightFields(node, config) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 2) {
      const text = node.textContent.trim();
      if (isJson(text)) {
        const jsonData = JSON.parse(text);
        const highlightedJson = highlightJson(jsonData, config);

        const pre = document.createElement('pre');
        pre.innerHTML = highlightedJson;
        node.parentNode.replaceChild(pre, node);
      }
    } else {
      for (const child of node.childNodes) {
        highlightFields(child, config);
      }
    }
  }

  function highlightJson(obj, config) {
    const idKeys = ["id", "issueTypeId", "serviceDeskId", "portalId", "groupIds"];

    let jsonString = JSON.stringify(obj, (key, value) => {
      if (config.showNulls || (value !== null && value !== "" && value !== undefined && (!Array.isArray(value) || value.length > 0))) {
        return value;
      }
    }, 2);

    if (!jsonString) return '';

    jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return jsonString.replace(/"(\u[a-zA-Z0-9]{4}|\[^u]|[^\"])*"(\s*:)?/g, function (match) {
      let cls = 'json-number';
      const keyMatch = match.match(/"([^"]+)"\s*:/);

      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key-highlight';
        } else {
          cls = 'json-string-highlight';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }

      if (keyMatch) {
        const key = keyMatch[1];
        if (idKeys.includes(key)) {
          cls = 'json-id';
        }
      }

      if (cls === 'json-id') {
        return `<span class="json-id">${match}</span>`;
      }

      if (cls.includes('string-highlight') || cls.includes('number')) {
        return `<span class="json-value-highlight">${match}</span>`;
      }

      return `<span class="${cls}">${match}</span>`;
    });
  }

  window.addEventListener('load', () => {
    chrome.storage.sync.get(['enabled', 'showNulls'], (data) => {
      if (data.enabled === false) return;

      const config = {
        showNulls: data.showNulls === true
      };

      const preTags = document.querySelectorAll('pre');
      if (preTags.length > 0) {
        preTags.forEach(tag => highlightFields(tag, config));
      } else {
        highlightFields(document.body, config);
      }
    });
  });
})();
