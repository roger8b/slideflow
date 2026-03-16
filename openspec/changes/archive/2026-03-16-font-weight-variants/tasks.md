## 1. Tipos e Dados de Variantes

- [x] 1.1 Adicionar tipo `FontVariant = { label: string; fontWeight: number; fontStyle: 'normal' | 'italic' }` em `src/constants/fonts.ts`
- [x] 1.2 Adicionar campo `variants?: FontVariant[]` ao tipo `FontItem` em `src/constants/fonts.ts`
- [x] 1.3 Preencher `variants` para cada fonte da `FONT_LIBRARY` (no mínimo Regular + Negrito para todas; Itálico onde aplicável), garantindo sincronia com os pesos já carregados via `GOOGLE_FONTS_URL`
- [x] 1.4 Atualizar `GOOGLE_FONTS_URL` para incluir pesos `400italic` e `600` onde necessário para cobrir todas as variantes declaradas

## 2. FontRow — Chevron e Expansão

- [x] 2.1 Adicionar props `variants`, `expanded`, `onToggleExpand`, `onVariantSelect`, e `activeVariant` ao componente `FontRow` em `FontSidebar.tsx`
- [x] 2.2 Renderizar o botão `>` (chevron rotacionado a 90° quando expandido) à esquerda do nome da fonte quando `variants` está presente
- [x] 2.3 Separar o clique do nome da fonte (aplica `fontFamily` via `onClick` existente) do clique do chevron (`onToggleExpand`)
- [x] 2.4 Renderizar sub-itens de variantes abaixo da linha principal quando `expanded === true`, com animação de altura (fade-in)
- [x] 2.5 Cada sub-item exibe o label e preview "AaBbCc" renderizado no `fontFamily` + `fontWeight` + `fontStyle` da variante
- [x] 2.6 Adicionar ícone ✓ no sub-item cuja variante corresponde exatamente ao `activeVariant` prop

## 3. Estado de Expansão no FontSidebar

- [x] 3.1 Adicionar estado `expandedFont: string | null` no `FontSidebar`
- [x] 3.2 Passar `expanded={expandedFont === font.value}` e `onToggleExpand` para cada `FontRow` nas seções Documento, Kit de Marca e Biblioteca
- [x] 3.3 Calcular `activeVariant` comparando `currentFont` + `currentStyle?.fontWeight` + `currentStyle?.fontStyle` com cada variante, e passar para o `FontRow` correto

## 4. Aplicação de Variante via Callback

- [x] 4.1 Generalizar `onFontSelect` em `FontSidebar` para aceitar segundo argumento opcional `extras?: { fontWeight: number; fontStyle: string }`
- [x] 4.2 No `onVariantSelect` de `FontRow`, chamar `onFontSelect(fontValue, { fontWeight, fontStyle })`
- [x] 4.3 Em `EditorContainer`, no handler de `onFontSelect`, se `extras` estiver presente, despachar `set-editor-props` com `{ fontFamily, fontWeight, fontStyle }`; caso contrário, manter dispatch de `set-editor-prop` apenas para `fontFamily`
