## 1. Shared Font Constants

- [x] 1.1 Criar `src/constants/fonts.ts` com a lista curada de fontes da biblioteca (extraída de `BrandKitPanel`), estruturada por categoria (sans-serif, serif, display), exportando `FONT_LIBRARY` como array de `{ name: string; value: string; category: string }`

## 2. FontSidebar — Estrutura e Abas

- [x] 2.1 Criar `src/components/editor/FontSidebar.tsx` com a estrutura base: props `isOpen`, `onClose`, `currentFont`, `currentStyle`, `onFontSelect`, `onStyleSelect`, `brandFonts`, `query`
- [x] 2.2 Implementar animação de slide-in/out da direita com `motion/react` (mesmo padrão de `ColorSidebar`)
- [x] 2.3 Adicionar header com título "Fonte" e botão X de fechar
- [x] 2.4 Implementar as duas abas ("Fonte" / "Estilos de Texto") com estado `activeTab` e troca por clique
- [x] 2.5 Implementar fechamento ao clicar fora (click-outside via ref + `mousedown` listener)

## 3. Aba Fonte — Grupos e Preview

- [x] 3.1 Implementar função utilitária `getDocumentFonts(serializedNodes)` que varre os nós Craft.js do slide ativo, coleta valores únicos de `fontFamily`, exclui tokens `var(--brand-font-*)`, e retorna array deduplicado
- [x] 3.2 Renderizar seção "Fontes do documento" com os resultados de `getDocumentFonts`; ocultar seção quando array vazio
- [x] 3.3 Renderizar seção "Kit de marca" com as 4 roles do brand kit (`title`, `header`, `subheader`, `body`), exibindo o role label e o nome da fonte resolvida
- [x] 3.4 Renderizar seção "Biblioteca" com `FONT_LIBRARY`, excluindo fontes já presentes em Documento ou Kit de marca
- [x] 3.5 Estilizar cada item com preview tipográfico: nome da fonte renderizado com `style={{ fontFamily: fontValue }}` + string muda "AaBbCc" à direita
- [x] 3.6 Adicionar ícone ✓ no item cuja `value` corresponde à `currentFont` prop

## 4. Aba Fonte — Busca

- [x] 4.1 Adicionar input de busca no topo da aba Fonte com ícone de lupa
- [x] 4.2 Implementar filtro client-side: ao digitar, filtrar itens de todos os grupos por `name.toLowerCase().includes(query)`
- [x] 4.3 Ocultar seções sem resultados durante busca ativa
- [x] 4.4 Exibir mensagem "Nenhuma fonte encontrada" quando nenhum grupo tem resultados

## 5. Aba Estilos de Texto

- [x] 5.1 Definir os presets do brand kit por role com valores padrão: `title` (40px/700), `header` (28px/700), `subheader` (20px/600), `body` (16px/400)
- [x] 5.2 Renderizar seção "Kit de marca" com os 4 presets, cada item exibindo o label e a prévia visual no estilo correspondente (font, size, weight)
- [x] 5.3 Implementar função `getDocumentStyles(serializedNodes)` que agrupa nós por `fontFamily + fontSize + fontWeight`, deduplica, ordena por fontSize decrescente e retorna os 5 primeiros
- [x] 5.4 Renderizar seção "Estilos do documento" com os resultados de `getDocumentStyles`; ocultar quando vazia
- [x] 5.5 Adicionar ícone ✓ no preset cujos 3 props (`fontFamily`, `fontSize`, `fontWeight`) correspondem exatamente ao elemento selecionado

## 6. Integração em EditorContainer

- [x] 6.1 Adicionar estados `isFontSidebarOpen` e `activeFontProp` em `EditorContainer` (espelhando `isColorSidebarOpen` / `activeColorProp`)
- [x] 6.2 Montar `<FontSidebar>` dentro de `EditorContainer` passando `isOpen`, `onClose`, `brandFonts`, e callback `onFontSelect`/`onStyleSelect`
- [x] 6.3 No callback `onFontSelect`, chamar `actions.setProp(nodeId, props => { props.fontFamily = value })`
- [x] 6.4 No callback `onStyleSelect`, chamar `actions.setProp` para `fontFamily`, `fontSize` e `fontWeight` simultaneamente
- [x] 6.5 Garantir que abrir `FontSidebar` fecha `ColorSidebar` e vice-versa (verificar no handler de abertura de cada um)

## 7. Integração em ContextualToolbar

- [x] 7.1 Adicionar prop `onOpenFontPicker: (nodeId: string, currentFont: string) => void` em `ContextualToolbar`
- [x] 7.2 Substituir o `<select>` de fonte por um `<button>` que exibe o nome da fonte atual (resolvendo `var(--brand-font-*)` para o nome legível) e dispara `onOpenFontPicker` ao clicar
- [x] 7.3 Passar `onOpenFontPicker` de `EditorContainer` para `ContextualToolbar`

## 8. Carregamento de Fontes da Biblioteca

- [x] 8.1 No mount do `FontSidebar`, injetar `<link>` do Google Fonts para todas as fontes de `FONT_LIBRARY` que ainda não estejam carregadas no DOM, prevenindo duplicatas
