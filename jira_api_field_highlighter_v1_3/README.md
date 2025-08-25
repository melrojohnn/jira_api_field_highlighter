# JIRA API Field Highlighter v1.3

---

## English

A browser extension to enhance the readability of JIRA's REST API JSON responses by color-coding fields based on their type and importance.

### Installation (from source)

Since this extension is not yet on the Chrome Web Store, you need to load it manually:

1.  Download or clone this repository to your local machine.
2.  Open your Chrome-based browser (like Google Chrome, Microsoft Edge, Brave, etc.).
3.  Navigate to the extensions page. You can usually find this at `chrome://extensions` or `edge://extensions`.
4.  Enable **Developer mode**. This is typically a toggle switch in the top-right corner of the page.
5.  Click the **"Load unpacked"** button.
6.  A file dialog will open. Select the directory where you saved the extension files (the folder containing `manifest.json`).
7.  The "JIRA API Field Highlighter" extension should now appear in your list of extensions, ready to use.

---

### Features

*   **Smart Highlighting**: Automatically color-codes keys and values in JIRA API JSON responses to make data easier to scan.
*   **Customizable View**: Use the popup to toggle features on the fly.
*   **Enable/Disable**: Quickly turn the highlighter on or off.
*   **Filter Nulls**: Hide fields that are `null` or empty to reduce clutter.
*   **Focus on Comments**: Isolate and view only the `comment` section of an issue.
*   **Focus on Main Fields**: Display only the most important issue data, such as `summary`, `description`, `assignee`, and `reporter`.
*   **Quick API Access**: A handy button to jump from a JIRA issue page (e.g., `/browse/PROJ-123`) directly to its REST API endpoint.

### How to Use

1.  Navigate to a JIRA REST API page (e.g., `https://your-jira.atlassian.net/rest/api/3/issue/PROJ-123`).
2.  The JSON response will be automatically highlighted according to the rules.
3.  Click the extension icon in your browser's toolbar to open the popup.
4.  Toggle the checkboxes to change settings. The page will reload to apply the new configuration.

### Color Legend

*   <span style="color: #ffe066; font-weight: bold;">Yellow Key</span>: Represents an ID (`id`, `issueTypeId`, etc.).
*   <span style="color: #ef6e70;">Pink Value</span>: The value of an ID field.
*   <span style="color: #7CFC98;">Light Green Value</span>: Core issue data (`summary`, `description`, `assignee`, `reporter` details).
*   <span style="color: #e28a16;">Orange Value</span>: General important data (`key`, `name`, `status`, etc.).
*   <span style="color: #5ba8f5;">Blue Value</span>: Data within a `customfield_`.
*   <span style="color: #ff9900; font-weight: bold;">Bold Orange Value</span>: Text content within a rich-text field (Jira Document Format).

---

## Português

Uma extensão de navegador para melhorar a legibilidade das respostas JSON da API REST do JIRA, colorindo os campos com base em seu tipo e importância.

### Instalação (a partir do código-fonte)

Como esta extensão ainda não está na Chrome Web Store, você precisa carregá-la manualmente:

1.  Baixe ou clone este repositório para sua máquina local.
2.  Abra seu navegador baseado em Chromium (como Google Chrome, Microsoft Edge, Brave, etc.).
3.  Navegue até a página de extensões. Geralmente, você pode acessá-la em `chrome://extensions` ou `edge://extensions`.
4.  Ative o **Modo do desenvolvedor**. Normalmente, é um interruptor no canto superior direito da página.
5.  Clique no botão **"Carregar sem compactação"** (ou "Load unpacked").
6.  Uma janela de seleção de arquivos será aberta. Selecione o diretório onde você salvou os arquivos da extensão (a pasta que contém o `manifest.json`).
7.  A extensão "JIRA API Field Highlighter" deve agora aparecer na sua lista de extensões e estar pronta para uso.

---

### Funcionalidades

*   **Destaque Inteligente**: Colore automaticamente chaves e valores nas respostas JSON da API do JIRA para facilitar a leitura dos dados.
*   **Visualização Customizável**: Use o popup para ativar ou desativar funcionalidades dinamicamente.
*   **Ativar/Desativar**: Ligue ou desligue o destaque rapidamente.
*   **Filtrar Nulos**: Oculte campos com valores `null` ou vazios para reduzir a poluição visual.
*   **Foco em Comentários**: Isole e visualize apenas a seção de `comment` de uma issue.
*   **Foco em Campos Principais**: Exiba apenas os dados mais importantes da issue, como `summary`, `description`, `assignee` e `reporter`.
*   **Acesso Rápido à API**: Um botão útil para ir de uma página de issue do JIRA (ex: `/browse/PROJ-123`) diretamente para o seu endpoint na REST API.

### Como Usar

1.  Navegue até uma página da REST API do JIRA (ex: `https://seu-jira.atlassian.net/rest/api/3/issue/PROJ-123`).
2.  A resposta JSON será destacada automaticamente de acordo com as regras.
3.  Clique no ícone da extensão na barra de ferramentas do seu navegador para abrir o popup.
4.  Marque ou desmarque as caixas de seleção para alterar as configurações. A página será recarregada para aplicar a nova configuração.

### Legenda de Cores

*   <span style="color: #ffe066; font-weight: bold;">Chave Amarela</span>: Representa um ID (`id`, `issueTypeId`, etc.).
*   <span style="color: #ef6e70;">Valor Rosa</span>: O valor de um campo de ID.
*   <span style="color: #7CFC98;">Valor Verde Claro</span>: Dados centrais da issue (`summary`, `description`, detalhes de `assignee`, `reporter`).
*   <span style="color: #e28a16;">Valor Laranja</span>: Dados gerais importantes (`key`, `name`, `status`, etc.).
*   <span style="color: #5ba8f5;">Valor Azul</span>: Dados dentro de um `customfield_`.
*   <span style="color: #ff9900; font-weight: bold;">Valor Laranja em Negrito</span>: Conteúdo de texto dentro de um campo de rich-text (Jira Document Format).

---