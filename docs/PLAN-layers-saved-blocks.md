# PLAN: Layers and Saved Blocks

## Contexto & Objetivos
- **Objetivo Central:** Implementar melhorias fundamentais e indispensáveis na construção de telas (Apresentações Não-lineares) usando Craft.js, a partir da funcionalidade nativa do React Flow.
- **Funcionalidades Escolhidas:** Árvore de Camadas (Option A) e Blocos Salvos (Option D).
- **Restrição Principal de Design:** Cuidado extremo para **não poluir a UI do aplicativo**. Deixar o ambiente limpo e evitar a superlotação de botões ou painéis sempre-visíveis. As ações devem ser contextuais ou agrupadas em abas (Tabs).

---

## 🏗️ Phase 1: Árvore de Camadas (Layers Panel)
**Meta:** Fornecer uma via rápida para o usuário entender o aninhamento dos nós estruturais e contornar a dificuldade de selecionar o container "pai" correto sem sujar o painel com painéis abertos constantemente.

- **Posicionamento:** Transformar o painel direito (`SettingsPanel.tsx`) acrescentando uma nova aba (ou substituindo). As abas passarão a ser: `Layers` | `Layout` | `Estilo` | `Configs`. O painel fica limpo, com "Layers" podendo ser ocultado enquanto se ajusta estilo.
- **Implementação:**
  1.  Criar o componente `LayersTree.tsx` que fará a consulta na árvore de nós do Craft.js: `query.getNodes()`.
  2.  Renderizar a estrutura de forma aninhada recursivamente com margens (`ml-2`), usando ícones minimalistas da Lucide correspondentes aos tipos dos nós (Container, Texto, Título, Imagem).
  3.  Adicionar um clique que force a seleção do nó na área de desenho nativa do Craft.js (`actions.selectNode()`).

## 🧱 Phase 2: Blocos Customizados (Saved Blocks)
**Meta:** Criar uma funcionalidade onde o usuário constrói algo no canvas e o salva para posterior reuso, sem necessitar de integração com backend agora (armazenamento persistente local).

- **Como Salvar (UX):** No `SettingsPanel`, quando houver um nó complexo (como Container) selecionado, adicionar um pequeno botão contextual (ao lado do de exclusão, ou na aba Config) chamado de `Save as Template` ou ícone `Bookmark`.
- **Persistência Temporária:** Ao clicar, serializar apenas a sub-árvore ("NodeTree") partindo do elemento selecionado via `query.node(id).toNodeTree()` e guardar no `localStorage` sob a chave `slideflow_saved_blocks`.
- **Como Inserir (Onde achar):**
  1. Na barra lateral esquerda (`SidebarPalette.tsx`), dividir o conteúdo com abas minimalistas na parte superior: `Basic & Layouts` | `Saved Blocks`.
  2. A aba `Saved Blocks` irá recuperar e renderizar a lista do LocalStorage.
  3. O nó pode ser injetado arrastando para a tela via manipuladores (`connectors.create(...)`), exigindo uma pequena conversão da árvore JSON para instâncias React (um desafio conhecido do Craft.js, possivelmente resolvível renderizando a NodeTree diretamente).

## 🧰 Phase 3: Validações e Polimento da UI
- [ ] O espaço da tela do `Canvas` e `EditorContainer` **não deve encolher** mais do que os `320px` ocupados pelas barras (Left e Right). Todos os incrementos visuais ocorrerão em Z-index (Modais) ou substituição horizontal (Abas).
- [ ] A Árvore de Camadas mostrará uma indicação de destaque (`bg-blue-50` por exemplo) em sintonia com a seleção atual no Canvas.
- [ ] Quando um "Saved Block" for apagado acidentalmente, não deve crashar as apresentações já salvas.
