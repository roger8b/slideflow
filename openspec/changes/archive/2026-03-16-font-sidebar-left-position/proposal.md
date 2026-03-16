## Why

O `FontSidebar` foi implementado para deslizar da direita, mas o padrão estabelecido pelo `ColorSidebar` — e esperado pelo usuário — é que painéis laterais do editor apareçam pelo lado esquerdo. A inconsistência de posição causa confusão de UX.

## What Changes

- `FontSidebar` muda de `right-0` para `left-0` (posição absoluta)
- A animação de entrada muda de `x: 320` para `x: -320` (slide da esquerda, como `ColorSidebar`)
- A borda lateral muda de `border-l` para `border-r`

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `font-sidebar`: posicionamento lateral corrigido para esquerda

## Impact

- `src/components/editor/FontSidebar.tsx` — três propriedades de estilo/animação
