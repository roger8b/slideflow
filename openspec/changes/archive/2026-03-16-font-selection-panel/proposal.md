## Why

A seleção de fonte no editor atual é feita via `<select>` nativo na toolbar contextual, expondo apenas as fontes do brand kit e sem nenhuma busca ou preview. Isso torna a experiência de tipografia pobre e inconsistente com editores modernos — o padrão Canva de painel lateral de fontes torna a descoberta e seleção muito mais eficiente.

## What Changes

- O seletor de fonte (`<select>`) na `ContextualToolbar` é substituído por um botão que abre um painel lateral deslizante de fontes (`FontSidebar`)
- O `FontSidebar` tem duas abas: **Fonte** e **Estilos de Texto**
- **Aba Fonte** — fontes organizadas em grupos:
  - *Fontes do documento*: fontes já em uso nos slides ativos (extraídas do layout Craft.js)
  - *Kit de marca*: fontes definidas no brand kit (title, header, subheader, body) com link "Editar"
  - *Biblioteca*: biblioteca curada de fontes (sans-serif, serif, display)
  - Campo de busca em tempo real no topo filtrando por nome de fonte em todos os grupos
  - Cada item exibe o nome da fonte renderizado na própria tipografia + preview "AaBbCc"
  - Fonte ativa marcada com ✓
- **Aba Estilos de Texto** — aplicação de estilo completo:
  - *Kit de marca*: Título, Subtítulo, Corpo — cada item aplica de uma vez font-family + font-size + font-weight definidos no brand kit
  - *Estilos do documento*: estilos tipográficos detectados nos slides (Título, Subtítulo, Corpo com valores concretos do documento)
  - Item ativo marcado com ✓
- O padrão de abertura/fechamento segue o `ColorSidebar` existente: triggered via evento, slide-in da direita, fechamento por clique fora ou `X`

## Capabilities

### New Capabilities
- `font-sidebar`: Painel lateral de seleção de fontes com busca, agrupamento por origem (brand kit / documento / biblioteca) e preview tipográfico
- `text-style-presets`: Seção dentro do FontSidebar com estilos de texto predefinidos do brand kit (Título, Subtítulo, Corpo) que aplicam múltiplas propriedades tipográficas de uma vez

### Modified Capabilities
- (none)

## Impact

- `src/components/editor/ContextualToolbar.tsx` — substitui o `<select>` de fonte por botão que dispara abertura do FontSidebar
- `src/components/editor/EditorContainer.tsx` — monta o novo `FontSidebar` e gerencia seu estado de abertura (mesmo padrão do `ColorSidebar`)
- Novo arquivo: `src/components/editor/FontSidebar.tsx`
- Sem quebra de dados: `fontFamily` continua sendo salvo como `var(--brand-font-*)` ou string direta
