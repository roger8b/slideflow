## Context

O `FontSidebar` foi implementado com `FontRow` — um botão simples que aplica `fontFamily`. A fonte é selecionada em uma etapa só, sem escolha de peso. Para adicionar variantes, o componente precisa de um estado de expansão local e a lista de fontes precisa de metadados de variantes.

A arquitetura de aplicação de props usa `window.dispatchEvent('set-editor-props')` para múltiplos props simultâneos — esse canal já existe e suporta o novo caso sem mudanças no `EditorContainer`.

## Goals / Non-Goals

**Goals:**
- Chevron `>` em cada linha de fonte que expande/colapsa variantes
- Variantes mostram label legível ("Regular", "Negrito", "Itálico") + preview tipográfico com o peso/estilo
- Seleção de variante aplica `fontFamily` + `fontWeight` + `fontStyle` de uma vez
- Variante ativa (match exato de fontFamily + fontWeight + fontStyle) marcada com ✓
- Um único item expandido por vez (abrir um colapsa o anterior)

**Non-Goals:**
- Busca de variantes via Google Fonts API (variantes são estáticas)
- Variantes para fontes do documento ou do kit de marca (apenas biblioteca)
- Mais de 4-5 variantes por fonte

## Decisions

### 1. Variantes como campo estático em `FontItem`

Adicionar `variants?: FontVariant[]` ao tipo `FontItem`, onde `FontVariant = { label: string; fontWeight: number; fontStyle: 'normal' | 'italic' }`.

**Alternativa considerada:** Derivar variantes da URL do Google Fonts. Rejeitado — requer chamada de API assíncrona, complexidade desnecessária, e o subset de pesos que carregamos já é fixo na URL do Google Fonts.

### 2. Estado de expansão: `expandedFont: string | null` no `FontSidebar`

Um único `useState` guarda o `value` da fonte expandida. Abrir uma fonte colapsa automaticamente a anterior.

### 3. `FontRow` refatorado para aceitar `variants` e `expanded`

`FontRow` recebe:
- `variants?: FontVariant[]`
- `expanded?: boolean`
- `onToggleExpand?: () => void`
- `onVariantSelect?: (variant: FontVariant) => void`
- `activeVariant?: { fontWeight: number; fontStyle: string }` — para marcar o ✓ no sub-item correto

Quando `variants` está presente, a linha mostra o chevron. Clicar no chevron (ou no `>`) chama `onToggleExpand`. Clicar no nome da fonte aplica `fontFamily` sem peso específico (comportamento existente preservado).

### 4. Aplicação de variante via `onFontSelect` com props extras

Em vez de criar um novo callback, `onFontSelect` é generalizado para aceitar um segundo argumento opcional `{ fontWeight, fontStyle }`. No `EditorContainer`, se esse objeto estiver presente, o dispatch usa `set-editor-props` com os três props; caso contrário, usa `set-editor-prop` apenas para `fontFamily` (retrocompatível).

**Alternativa considerada:** Novo callback `onVariantSelect`. Rejeitado — aumenta a superfície de API sem necessidade.

## Risks / Trade-offs

- **Variantes estáticas podem não refletir o que o Google Fonts carregou:** Mitigação: as variantes declaradas em `FONT_LIBRARY` devem corresponder exatamente aos pesos presentes na URL `GOOGLE_FONTS_URL`. Manter as duas listas em sincronia.
- **FontRow fica mais complexo:** Aceito — é o único lugar onde isso vive e a lógica é local.
