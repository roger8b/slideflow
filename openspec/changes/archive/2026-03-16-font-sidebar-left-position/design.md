## Context

`ColorSidebar` usa `left-0`, `initial={{ x: -320 }}`, `border-r`. `FontSidebar` foi implementado espelhado incorretamente.

## Goals / Non-Goals

**Goals:** Alinhar `FontSidebar` ao padrão de posicionamento do `ColorSidebar`.

**Non-Goals:** Qualquer outra mudança de layout ou comportamento.

## Decisions

Três substituições pontuais em `FontSidebar.tsx`:
- `right-0` → `left-0`
- `x: 320` → `x: -320` (em `initial` e `exit`)
- `border-l` → `border-r`

## Risks / Trade-offs

Nenhum risco — mudança puramente visual e localizada em um único arquivo.
