## Context

O editor usa `ContextualToolbar` para controles rápidos de texto. A seleção de fonte atual é um `<select>` nativo que mostra apenas as 4 fontes do brand kit (title, header, subheader, body) sem preview, sem busca e sem estilos tipográficos compostos.

O `ColorSidebar` já estabelece o padrão de painel lateral no projeto: estado de abertura em `EditorContainer`, abertura via callback prop em `ContextualToolbar`, slide-in da direita, fechamento por clique fora. O `FontSidebar` seguirá exatamente o mesmo padrão.

## Goals / Non-Goals

**Goals:**
- Substituir o `<select>` de fonte por painel lateral rico seguindo o padrão `ColorSidebar`
- Duas abas: **Fonte** (seleção de font-family) e **Estilos de Texto** (presets compostos)
- Grupos na aba Fonte: Kit da Marca, Fontes do Documento, Biblioteca
- Busca em tempo real por nome de fonte
- Preview de cada fonte renderizado na própria tipografia
- Checkmark na fonte/estilo atualmente aplicado ao elemento selecionado
- Aba Estilos de Texto: presets do kit da marca + estilos detectados no documento

**Non-Goals:**
- Upload de fontes customizadas (fora de escopo)
- Integração com Google Fonts API em tempo real
- Histórico de "fontes usadas recentemente"
- Variações/weights de uma família de fontes (expansão futura)

## Decisions

### 1. Mesmo padrão de abertura que `ColorSidebar`

O `FontSidebar` é montado dentro de `EditorContainer` e controlado via `isOpen` state. O `ContextualToolbar` recebe um callback `onOpenFontPicker` e o dispara ao clicar no botão de fonte.

**Alternativa considerada:** Custom DOM event (como `set-editor-prop`). Rejeitado — aumenta indireção desnecessária para um padrão já estabelecido via props.

### 2. Fonte ativa via comparação de prop

A fonte ativa é determinada comparando `selected.props.fontFamily` com o valor de cada opção. Fontes do brand kit são salvas como `var(--brand-font-title)` etc.; fontes da biblioteca/documento como string direta (ex: `'Inter', sans-serif`).

Ao selecionar uma fonte do **Kit da Marca**, salvar como `var(--brand-font-<role>)` (preserva ligação dinâmica ao brand). Ao selecionar da **Biblioteca** ou **Documento**, salvar o valor string diretamente.

### 3. Fontes do documento extraídas via Craft.js query

"Fontes do documento" = fontes em uso nos nós do editor ativo. Extrair via `query.getSerializedNodes()` filtrando props `fontFamily`. Deduplicar e excluir `var(--brand-font-*)` (já listadas no grupo Kit da Marca).

**Alternativa considerada:** varrer o `data.layout` serializado de todos os slides. Rejeitado — necessita deserializar todos os slides e está fora do editor ativo. O grupo "do documento" é contextual ao slide aberto.

### 4. Biblioteca como lista estática

A biblioteca de fontes é a mesma lista curada já presente em `BrandKitPanel` (Inter, Instrument Sans, Outfit, Montserrat, Space Grotesk, EB Garamond, Playfair Display, Fraunces, etc.), extraída para uma constante compartilhada em `src/constants/fonts.ts`.

Fontes já listadas no Kit da Marca ou no Documento são omitidas da Biblioteca para evitar duplicatas.

### 5. Preview tipográfico via `fontFamily` inline

Cada item renderiza o nome da fonte com `style={{ fontFamily: fontValue }}`. As fontes da biblioteca são Google Fonts já carregadas no projeto (confirmado em `BrandKitPanel`). Nenhuma requisição adicional de carregamento.

### 6. Estilos de Texto: presets definidos por role do brand kit

Os presets do **Kit de Marca** são derivados dos roles do brand (`title`, `header`, `subheader`, `body`), com valores de fontSize/fontWeight pré-definidos por role:

| Role     | fontSize | fontWeight |
|----------|----------|------------|
| title    | 40       | 700        |
| header   | 28       | 700        |
| subheader| 20       | 600        |
| body     | 16       | 400        |

Ao aplicar um estilo, `setProp` é chamado para `fontFamily`, `fontSize` e `fontWeight` simultaneamente.

**Estilos do documento** são derivados de nós existentes: agrupar nós por combinação `fontFamily + fontSize + fontWeight`, deduplzar, e exibir os 3 mais frequentes como "Título", "Subtítulo", "Corpo" (por tamanho decrescente).

### 7. Busca: filtro client-side, case-insensitive

A busca filtra o nome de exibição de todas as fontes nas três seções simultaneamente. Seções sem resultados são ocultadas. Busca é disparada com `onChange` (sem debounce necessário dado o tamanho pequeno da lista).

## Risks / Trade-offs

- **Fontes da biblioteca não carregadas:** Se uma fonte da biblioteca ainda não foi aplicada a nenhum elemento, seu `@import` do Google Fonts pode não estar no DOM → o preview aparecerá na fonte padrão. Mitigação: injetar `<link>` do Google Fonts para todas as fontes da biblioteca no mount do `FontSidebar`.
- **Estilos do documento frágeis:** Derivar estilos de nós existentes é heurístico — pode retornar resultados inesperados em slides muito heterogêneos. Mitigação: limitar a 3-5 estilos e ordenar por frequência de uso.
- **Paridade de estado com `ColorSidebar`:** Dois sidebars abertos simultaneamente causariam sobreposição. Mitigação: fechar `ColorSidebar` ao abrir `FontSidebar` e vice-versa (controle centralizado em `EditorContainer`).

## Open Questions

- As fontes do documento devem ser extraídas apenas do slide ativo ou de todos os slides da apresentação? (Assumido: slide ativo — mais performático e contextualmente relevante)
- Os roles de font-size por estilo devem ser configuráveis no brand kit? (Assumido: fixos por enquanto, configurável no brand kit é escopo futuro)
