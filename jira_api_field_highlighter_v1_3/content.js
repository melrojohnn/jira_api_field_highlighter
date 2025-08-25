(function () {
  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function removeAvatarUrls(obj) {
    if (Array.isArray(obj)) {
      return obj.map(removeAvatarUrls);
    } else if (obj && typeof obj === 'object') {
      const newObj = {};
      for (const key in obj) {
        if (key === 'avatarUrls') continue;
        newObj[key] = removeAvatarUrls(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  function filterJsonForComments(obj) {
    // Retorna apenas o campo 'comment', mesmo se vazio, e remove avatarUrls
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(filterJsonForComments);
      }
      if ('comment' in obj) {
        return removeAvatarUrls({ comment: obj.comment });
      }
      // Se não tem 'comment', retorna objeto vazio
      console.log('[JIRA Highlighter] Comment field not found in JSON.');
      return { comment: {} };
    }
    return obj;
  }

  function filterJsonForMainFields(obj) {
    // Retorna apenas summary, description, assignee, reporter (com subcampos)
    if (!obj || typeof obj !== 'object') return obj;
    const mainFields = ['summary', 'description', 'assignee', 'reporter'];
    const subFields = ['accountId', 'emailAddress', 'displayName'];
    let result = {};
    for (const key of mainFields) {
      if (key in obj) {
        if (key === 'assignee' || key === 'reporter') {
          if (obj[key] && typeof obj[key] === 'object') {
            result[key] = {};
            for (const sub of subFields) {
              if (sub in obj[key]) {
                result[key][sub] = obj[key][sub];
              }
            }
          }
        } else {
          result[key] = obj[key];
        }
      }
    }
    if (Object.keys(result).length === 0) {
      console.log('[JIRA Highlighter] None of the main fields were found in the JSON.');
    }
    return result;
  }

  function highlightFields(node, config) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 2) {
      const text = node.textContent.trim();
      if (isJson(text)) {
        let jsonData = JSON.parse(text);
        // Novo: aplicar filtros dentro de 'fields' se existir
        if (jsonData.fields && typeof jsonData.fields === 'object') {
          if (config.showOnlyComments) {
            console.log('[JIRA Highlighter] Active filter: Show only comments (in fields)');
            jsonData.fields = filterJsonForComments(jsonData.fields);
            console.log('[JIRA Highlighter] Filtered JSON:', jsonData.fields);
          } else if (config.showMainFields) {
            console.log('[JIRA Highlighter] Active filter: Show main issue data (in fields)');
            jsonData.fields = filterJsonForMainFields(jsonData.fields);
            console.log('[JIRA Highlighter] Filtered JSON:', jsonData.fields);
          }
        } else {
          if (config.showOnlyComments) {
            console.log('[JIRA Highlighter] Active filter: Show only comments');
            jsonData = filterJsonForComments(jsonData);
            console.log('[JIRA Highlighter] Filtered JSON:', jsonData);
          } else if (config.showMainFields) {
            console.log('[JIRA Highlighter] Active filter: Show main issue data');
            jsonData = filterJsonForMainFields(jsonData);
            console.log('[JIRA Highlighter] Filtered JSON:', jsonData);
          }
        }
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
    const greenKeys = [
      "key", "colorName", "name", "accountId", "displayName",
      "friendly", "emailAddress", "value", "type", "text",
      "status", "statusCategory"
    ];
    const lightGreenKeys = ["summary", "description"];
    const assigneeReporterKeys = ["assignee", "reporter"];
    const assigneeReporterSubKeys = ["accountId", "emailAddress", "displayName"];
    const ignoreKeys = ["self", "expand"];

    let lastParentKey = null;
    let lastKey = null;
    let parentStack = [];

    // Adaptação: parse o JSON para gerar um mapa de caminhos de chaves
    // para saber se estamos dentro de assignee/reporters
    // Como highlightJson trabalha com regex, vamos usar um truque:
    // - Ao encontrar uma chave, atualize o parentStack
    // - Ao encontrar um valor, use o parentStack para decidir a cor

    let jsonString = JSON.stringify(obj, (key, value) => {
      if (config.showNulls || (value !== null && value !== "" && value !== undefined && (!Array.isArray(value) || value.length > 0))) {
        return value;
      }
    }, 2);

    if (!jsonString) return '';

    jsonString = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Regex para identificar o nível de indentação
    let currentParent = [];
    let lastIndent = 0;

    return jsonString.replace(/^(\s*)"([^"]+)"(\s*):(.*)$/gm, function(line, indent, key, colon, rest) {
      let cls = '';
      let valueMatch = rest.match(/^\s*"([^"]*)"/);
      let value = valueMatch ? valueMatch[1] : null;
      let currentIndent = indent.length;
      // Atualiza parentStack
      if (currentIndent > lastIndent) {
        if (lastKey !== null) currentParent.push(lastKey);
      } else if (currentIndent < lastIndent) {
        let diff = (lastIndent - currentIndent) / 2;
        while (diff-- > 0) currentParent.pop();
      }
      lastIndent = currentIndent;
      lastKey = key;

      // Checagem se está dentro de customfield_
      let isInsideCustomField = currentParent.some(p => typeof p === 'string' && p.startsWith('customfield_'));

      // Checagem para azul claro apenas para 'value' dentro de customfield_
      let isCustomFieldValue = isInsideCustomField && key === 'value';

      // Checagem para laranja (doc/text/type)
      let isDocText = (key === 'type' || key === 'text');

      // Log de depuração para ids dentro de customfield_
      if (key === 'id') {
        if (isInsideCustomField) {
          console.log('[JIRA Highlighter] id inside customfield_:', [...currentParent, key].join(' > '));
        } else {
          console.log('[JIRA Highlighter] id outside customfield_:', [...currentParent, key].join(' > '));
        }
      }

      // Checagem se está dentro de um objeto doc
      let isInsideDoc = false;
      for (let i = currentParent.length - 1; i >= 0; i--) {
        if (currentParent[i + 1] === 'content' && currentParent[i] && typeof currentParent[i] === 'string') continue;
        if (currentParent[i] && typeof currentParent[i] === 'string' && currentParent[i].startsWith('customfield_')) break;
        if (currentParent[i] && typeof currentParent[i] === 'string' && currentParent[i] === 'type:doc') {
          isInsideDoc = true;
          break;
        }
      }
      // Alternativa: se algum parent for um objeto com chave 'type' e valor 'doc'
      if (!isInsideDoc && currentParent.includes('type:doc')) isInsideDoc = true;
      // Detecta se a linha atual é 'type': 'doc' e marca no parentStack
      if (key === 'type' && value === 'doc') {
        currentParent.push('type:doc');
      }

      // Checagem para verde claro
      let isLightGreen = false;
      if (lightGreenKeys.includes(key)) {
        isLightGreen = true;
      } else if (currentParent.length > 0 && assigneeReporterKeys.includes(currentParent[currentParent.length-1]) && assigneeReporterSubKeys.includes(key)) {
        isLightGreen = true;
      }

      // Checagem para verde forte
      let isGreen = greenKeys.includes(key);

      // Checagem para id (chave amarela, valor rosa)
      let isId = key === 'id';
      let isOtherId = idKeys.includes(key) && key !== 'id';

      // Checagem para azul claro
      let isCustomField = key.startsWith('customfield_');

      // Checagem para ignorar
      let isIgnore = ignoreKeys.includes(key);

      // Checagem para verde claro especial no filtro de comentários
      let isCommentLightGreen = false;
      if (config && config.showOnlyComments && (key === 'accountId' || key === 'emailAddress' || key === 'displayName')) {
        isCommentLightGreen = true;
      }

      // Checagem para amarelo especial no filtro de comentários
      let isCommentYellow = false;
      if (config && config.showOnlyComments && (key === 'created' || key === 'updated')) {
        isCommentYellow = true;
      }

      // Aplica cor na chave
      let keyHtml = isIgnore ? `"${key}"` : isId ? `<span class=\"json-key-id\">"${key}"</span>` : `<span class=\"json-key-highlight\">"${key}"</span>`;
      let valueHtml = rest;
      // Aplica cor no valor
      if (isIgnore) {
        // nada
      } else if (isCommentLightGreen && value !== null) {
        valueHtml = colon + ' <span class=\"json-light-green\">"' + value + '"</span>';
      } else if (isCommentYellow && value !== null) {
        valueHtml = colon + ' <span class=\"json-key-id\">"' + value + '"</span>';
      } else if (isDocText && value !== null) {
        valueHtml = colon + ' <span class=\"json-doc-text\">"' + value + '"</span>';
      } else if (isCustomFieldValue && value !== null) {
        valueHtml = colon + ' <span class=\"json-value-highlight\">"' + value + '"</span>';
      } else if (isId && value !== null) {
        valueHtml = colon + ' <span class=\"json-id\">"' + value + '"</span>';
      } else if (isOtherId && value !== null) {
        valueHtml = colon + ' <span class=\"json-id\">"' + value + '"</span>';
      } else if (isLightGreen && value !== null) {
        valueHtml = colon + ' <span class=\"json-light-green\">"' + value + '"</span>';
      } else if (isGreen && value !== null) {
        valueHtml = colon + ' <span class=\"json-text-highlight\">"' + value + '"</span>';
      } else if (isCustomField && value !== null) {
        valueHtml = colon + ' <span class=\"json-value-highlight\">"' + value + '"</span>';
      }
      return indent + keyHtml + valueHtml;
    });
  }

  // Guarda o conteúdo original para restaurar
  let originalContent = {};

  function runHighlighter() {
    // Restaura o conteúdo original antes de re-aplicar
    for (const key in originalContent) {
      const { parent, node } = originalContent[key];
      parent.replaceChild(node, document.querySelector(`pre[data-highlighter-key="${key}"]`));
    }
    originalContent = {};

    chrome.storage.sync.get(['enabled', 'showNulls', 'showOnlyComments', 'showMainFields'], (data) => {
      if (data.enabled === false) return;
      const config = {
        showNulls: data.showNulls === true,
        showOnlyComments: data.showOnlyComments === true,
        showMainFields: data.showMainFields === true
      };

      const preTags = document.querySelectorAll('pre');
      if (preTags.length > 0) {
        preTags.forEach((tag, index) => {
          // Guarda o estado original antes de modificar
          originalContent[index] = { parent: tag.parentNode, node: tag.cloneNode(true) };
          highlightFields(tag, config);
          // Marca o novo elemento para poder encontrá-lo depois
          const newPre = document.querySelector('pre:not([data-highlighter-key])');
          if(newPre) newPre.dataset.highlighterKey = index;
        });
      } else {
        // A lógica para document.body é mais complexa para restaurar,
        // focando em <pre> por enquanto.
        highlightFields(document.body, config);
      }
    });
  }

  window.addEventListener('load', () => {
    chrome.storage.sync.get(['enabled', 'showNulls', 'showOnlyComments', 'showMainFields'], (data) => {
      if (data.enabled === false) return;
      const config = {
        showNulls: data.showNulls === true,
        showOnlyComments: data.showOnlyComments === true,
        showMainFields: data.showMainFields === true
      };
      const preTags = document.querySelectorAll('pre');
      if (preTags.length > 0) {
        preTags.forEach(tag => highlightFields(tag, config));
      } else {
        highlightFields(document.body, config);
      }
    });
  });

  // Ouve mensagens do popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "rerunHighlighter") {
      // A lógica de restauração e re-aplicação precisa ser implementada aqui.
      window.location.reload(); // Solução temporária até a lógica de restauração ser implementada.
    }
  });
})();
