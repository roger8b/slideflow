## Why

O `FontSidebar` implementado exibe cada fonte como uma linha fixa que aplica apenas `fontFamily`. O Canva — referência de design escolhida — mostra um botão `>` ao lado de cada fonte que expande a linha para exibir as variantes disponíveis (Regular, Negrito, Itálico, etc.), permitindo selecionar peso e estilo ao mesmo tempo. Essa camada de controle tipográfico está faltando na nossa implementação atual.

## What Changes

- Cada item de fonte na **aba Fonte** do `FontSidebar` ganha um botão `>` (chevron) à esquerda
- Clicar no chevron expande a linha exibindo as variantes disponíveis para aquela família (ex: Regular, Negrito, Itálico, Negrito Itálico)
- Clicar em uma variante aplica simultaneamente `fontFamily` + `fontWeight` + `fontStyle` ao elemento selecionado
- Clicar diretamente no nome da fonte (sem expandir) continua funcionando como antes — aplica apenas `fontFamily`
- A lista de variantes por fonte é definida estaticamente em `FONT_LIBRARY` via campo `variants`
- O estado de expansão é local ao `FontSidebar` (um item expandido por vez)

## Capabilities

### New Capabilities
- `font-weight-variants`: Expansão inline de variantes tipográficas (peso + estilo) por família de fontes no painel `FontSidebar`

### Modified Capabilities
- (none)

## Impact

- `src/constants/fonts.ts` — adicionar campo `variants` em cada `FontItem`
- `src/components/editor/FontSidebar.tsx` — expandir `FontRow` com chevron e sub-itens de variantes
- Callbacks de seleção de fonte precisam suportar `fontWeight` e `fontStyle` opcionais junto de `fontFamily`
- `src/components/editor/EditorContainer.tsx` — dispatch de `set-editor-props` já suporta múltiplos props; sem mudança necessária
