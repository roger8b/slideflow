# PLAN-inline-text-icon

## Objective

Implement a low-friction way to compose `Title` and `Text` with `Icon` on the same line, without exigir que o usuário entenda `flexbox` ou `grid`.

## Problem Statement

Hoje `Title` e `Text` sempre ocupam `100%` da largura, o que dificulta composições como:

- ícone antes do título
- ícone depois do título
- ícone + texto descritivo em uma única linha

Ao mesmo tempo, a solução precisa coexistir com os dois modos de layout já existentes:

- `Flexbox`
- `Grid`

## Assumptions

- O caminho de menor risco é evoluir `Title` e `Text` para suportarem largura por conteúdo.
- A experiência deve ser guiada por linguagem orientada a resultado, não por jargão técnico.
- O `SettingsPanel` é o principal ponto de configuração.
- Presets e ações rápidas valem mais do que controles avançados expostos logo de início.

## Success Criteria

- Usuário consegue montar um “título com ícone” sem precisar entender `row`, `alignItems` ou `grid`.
- `Title` e `Text` podem alternar entre largura total e largura do conteúdo.
- A solução funciona dentro de containers `flex` e `grid`.
- A UI reduz tentativa e erro com presets, labels claros e preview previsível.
- O comportamento atual existente continua funcionando por padrão.

## Scope

### In Scope

- Evolução de `Title` e `Text` para suportar modo de largura configurável
- Melhorias no `SettingsPanel` para tornar esse controle fácil de entender
- Presets de composição com ícone + texto/título
- Pequenos ajustes no fluxo de inserção para tornar a funcionalidade descoberta
- Validação manual no editor e via `npm run lint`

### Primary Touchpoints

- `src/components/editor/selectors/Title.tsx`
- `src/components/editor/selectors/Text.tsx`
- `src/components/editor/SettingsPanel.tsx`
- `src/components/editor/TextPanel.tsx`
- `src/components/editor/FloatingToolbar.tsx`

### Secondary Touchpoints

- `src/components/editor/LayersTree.tsx`
- eventuais helpers internos para factory de presets, se a duplicação começar a crescer

### Out of Scope

- Novo componente semântico dedicado como `TitleWithIcon`
- Mudança estrutural grande na arquitetura do Craft.js
- Reescrever o modelo de `Container`

## Implementation Strategy

### Phase 0: UX Framing

Definir uma linguagem de produto antes do código.

Decisões:

- Não expor `widthMode` com esse nome na interface
- Usar rótulos de intenção:
  - `Largura da linha`
  - `Ocupar toda a linha`
  - `Ajustar ao conteúdo`
- No `Container`, evitar exigir configuração manual para o caso principal
- Criar uma ação pronta com nomenclatura explícita:
  - `Título com ícone`
  - `Texto com ícone`

Entrega:

- microcopy final para controles e presets
- mapeamento entre rótulo amigável e props internas

Microcopy recomendada:

- Seção: `Layout do texto`
- Controle: `Largura da linha`
- Opção 1: `Ocupar toda a linha`
- Opção 2: `Ajustar ao conteúdo`
- Ajuda curta: `Ideal para usar com ícones ou outros elementos na mesma linha.`

Decisão adicional:

- manter o controle visual como segmented control, não `select`
- mostrar só duas opções, sem estados intermediários

### Phase 1: Add Width Behavior to Text Components

Evoluir `Title` e `Text` para suportar dois comportamentos:

- `fill`: mantém `100%`
- `hug`: ocupa apenas o tamanho do conteúdo

Detalhes de implementação:

- adicionar prop nova compartilhada entre os dois componentes
- manter `fill` como default para preservar retrocompatibilidade
- ajustar classes/styles que hoje fixam `w-full`
- garantir que edição inline continue funcionando no modo `hug`

Riscos:

- seleção e drag no Craft.js em elementos menores
- textarea/contenteditable com largura automática

Mitigação:

- manter área clicável com padding consistente
- testar edição com texto curto e longo

Decisões técnicas propostas:

- prop interna: `widthMode?: 'fill' | 'hug'`
- default: `fill`
- renderização:
  - `fill` => wrapper com largura total
  - `hug` => wrapper `inline-block` ou largura de conteúdo, preservando padding e seleção
- separar, se necessário, a área visual do conteúdo da área de drag para evitar perda de usabilidade

Critérios de aceite da fase:

- `Title` em `fill` continua visualmente idêntico ao comportamento atual
- `Text` em `fill` continua visualmente idêntico ao comportamento atual
- `Title` em `hug` consegue conviver com `Icon` em linha sem ocupar 100%
- `Text` em `hug` consegue conviver com `Icon` em linha sem ocupar 100%

### Phase 2: Make the Settings UI Friendly

Adicionar no `SettingsPanel` uma seção simples para `Title` e `Text`:

- `Largura da linha`
- opções:
  - `Ocupar toda a linha`
  - `Ajustar ao conteúdo`

Diretrizes de UX:

- posicionar o controle dentro de `Typography` ou em uma seção nova chamada `Layout do texto`
- usar descrição curta logo abaixo:
  - `Use "Ajustar ao conteúdo" para combinar com ícones ou outros elementos na mesma linha.`
- esconder qualquer termo como `block`, `inline`, `flex item`, `hug`, `fill`

Entrega:

- controle binário claro
- ajuda contextual curta

Fluxo de UX desejado:

1. Usuário seleciona `Title` ou `Text`
2. Encontra `Layout do texto` sem precisar abrir painel avançado
3. Clica em `Ajustar ao conteúdo`
4. O componente já fica pronto para ser usado com ícone na mesma linha

Decisões de interface:

- colocar `Layout do texto` logo abaixo de `Typography` ou no topo dela
- usar botões lado a lado com linguagem natural
- evitar input textual, dropdown técnico ou tooltip obrigatória

Critérios de aceite da fase:

- o usuário consegue entender a diferença entre as duas opções sem documentação externa
- o painel não aumenta fricção com controles redundantes
- a interface continua consistente com o estilo atual do editor

### Phase 3: Add Ready-Made Presets for Common Cases

Criar atalhos de inserção para os casos principais.

Presets mínimos:

- `Título com ícone à esquerda`
- `Título com ícone à direita`
- `Texto com ícone à esquerda`

Forma recomendada:

- inserir um `Container` já configurado horizontalmente
- com `alignItems` centralizado
- `gap` adequado
- `Title` ou `Text` já em modo `Ajustar ao conteúdo`
- `Icon` já inserido

Pontos de entrada possíveis:

- `FloatingToolbar`
- `TextPanel`
- templates rápidos

Diretriz:

- o usuário deve conseguir começar pelo preset e só depois refinar

Recomendação de entrada principal:

- usar `TextPanel` como ponto principal de descoberta porque a intenção do usuário já é “adicionar texto”
- opcionalmente duplicar o preset no `FloatingToolbar` se houver espaço sem poluir a barra

Preset base recomendado:

- `Container`
  - `display: flex`
  - `flexDirection: row`
  - `alignItems: center`
  - `justifyContent: flex-start`
  - `gap` confortável
  - `padding: 0`
  - `height: auto`
- filho 1: `Icon`
- filho 2: `Title` ou `Text` com `widthMode: 'hug'`

Critérios de aceite da fase:

- usuário consegue inserir `Título com ícone` com um clique ou arraste
- o bloco nasce funcional sem ajustes obrigatórios
- a composição mantém boa aparência em largura ampla e estreita

### Phase 4: Reduce Flex/Grid Friction

A funcionalidade precisa funcionar em ambos os layouts, mas o usuário não deve pensar nisso para o caso simples.

Abordagem:

- para composição inline, sempre usar internamente um `Container` horizontal
- esse bloco pode ser colocado tanto dentro de uma área `flex` quanto dentro de uma célula `grid`
- no caso de `grid`, o preset deve se comportar como um item único dentro da célula

Melhorias desejáveis:

- se o `Container` selecionado estiver em `grid`, manter o preset como um bloco autocontido
- evitar depender de configurações externas do pai para o alinhamento básico

Resultado esperado:

- o usuário só insere “Título com ícone” e move o bloco para onde quiser

Regra de produto:

- o usuário monta “blocos de conteúdo”
- não precisa pensar em “como configurar a linha”
- o preset já encapsula a linha

Fallback seguro:

- mesmo se o pai estiver em `grid`, o bloco interno continua sendo `flex row`
- isso reduz dependência do contexto externo e facilita previsibilidade

Critérios de aceite da fase:

- preset inserido em célula de `grid` continua alinhado corretamente
- preset inserido em `flex column` continua empilhando normalmente como um bloco

### Phase 5: Guided Polishing

Refinar a experiência para reduzir dúvidas.

Itens:

- placeholder visual melhor para o texto do preset
- nome amigável no Layers Tree:
  - `Title + Icon`
  - ou label customizada ao criar o bloco
- default icon mais neutro e útil
- espaçamento padrão visualmente equilibrado

Opcional se o esforço for baixo:

- botão contextual no `SettingsPanel` de `Title`/`Text`:
  - `Criar linha com ícone`

Essa ação pode ser poderosa, mas só vale se não complicar a manipulação da árvore do Craft.js.

Polimento adicional recomendado:

- labels customizados no momento da criação do preset
- ícone default mais próximo de casos reais, por exemplo `ArrowUpRight`, `Sparkles` ou `BadgeCheck`
- placeholders de texto que demonstrem a intenção do bloco:
  - `Resultado principal`
  - `Conteúdo`
  - `Próximo passo`

## Detailed Task Breakdown

### Workstream A: Component Model

1. Adicionar nova prop de largura em `Title`
2. Adicionar nova prop de largura em `Text`
3. Ajustar renderização para respeitar modo de largura
4. Preservar defaults existentes
5. Validar edição inline nos dois modos

### Workstream B: Settings Panel

1. Definir nomenclatura amigável
2. Adicionar controle de largura para `Title`
3. Adicionar controle de largura para `Text`
4. Inserir helper text explicando o caso de uso
5. Revisar ordem das seções para baixa fricção

### Workstream C: Insertion Presets

1. Escolher o melhor ponto de entrada principal
2. Criar preset `Título com ícone à esquerda`
3. Criar preset `Título com ícone à direita`
4. Criar preset `Texto com ícone à esquerda`
5. Garantir labels claras e descoberta rápida

### Workstream E: Discoverability and Naming

1. Revisar nomenclatura em `TextPanel`
2. Decidir se o `FloatingToolbar` recebe 1 atalho compacto ou nenhum
3. Ajustar labels de árvore para facilitar identificação
4. Padronizar placeholders e ícones iniciais

### Workstream D: Validation

1. Testar preset em container `flex`
2. Testar preset em container `grid`
3. Testar texto curto, longo e multiline
4. Testar edição inline após trocar largura
5. Rodar `npm run lint`

## UX Decisions

### Preferred Labels

- `Largura da linha`
- `Ocupar toda a linha`
- `Ajustar ao conteúdo`
- `Combinar com ícone`

### Terms to Avoid in UI

- `fill`
- `hug`
- `inline-block`
- `flex item`
- `grid item`

### Preset Naming

Preferir nomes orientados a resultado:

- `Título com ícone`
- `Título com ícone à direita`
- `Texto com ícone`

Evitar nomes técnicos:

- `Horizontal Row`
- `Inline Layout`
- `Flex Row`

### Suggested User Journey

Fluxo ideal para usuário iniciante:

1. Abrir painel de texto
2. Escolher `Título com ícone`
3. Editar o texto diretamente no canvas
4. Trocar o ícone no painel lateral, se quiser
5. Seguir com o layout sem precisar abrir controles de container

Fluxo secundário para usuário avançado:

1. Inserir `Title` ou `Text`
2. Trocar para `Ajustar ao conteúdo`
3. Combinar manualmente com `Icon` dentro de um container

## Risks and Mitigations

### Risk: User still needs to understand container layout

Mitigation:

- usar presets prontos como caminho principal
- deixar configuração manual como caminho secundário

### Risk: `hug` quebrar edição ou seleção

Mitigation:

- manter padding e área clicável visível
- testar com conteúdo vazio, curto e longo

### Risk: Grid layouts behave inconsistently

Mitigation:

- tratar o preset como bloco autocontido
- validar dentro de colunas estreitas e largas

### Risk: Too many controls in Settings Panel

Mitigation:

- adicionar só o controle essencial
- manter ajuda textual curta
- evitar expor opções avançadas nesta primeira versão

### Risk: Presets duplicarem lógica demais no código

Mitigation:

- começar com composição inline definida localmente
- se a quantidade de presets crescer, extrair factories ou helpers de criação

## Recommended Delivery Order

1. Implementar prop de largura em `Title` e `Text`
2. Expor controle amigável no `SettingsPanel`
3. Criar presets de inserção
4. Refinar labels e defaults visuais
5. Validar manualmente e rodar lint

## Milestones

### Milestone 1: Foundation

- largura configurável em `Title`
- largura configurável em `Text`
- retrocompatibilidade preservada

### Milestone 2: Friendly Controls

- novo controle no `SettingsPanel`
- microcopy final aplicada
- comportamento entendível sem jargão técnico

### Milestone 3: Fast Path

- preset `Título com ícone`
- preset `Texto com ícone`
- descoberta via `TextPanel`

### Milestone 4: Final QA

- validação em `flex`
- validação em `grid`
- `npm run lint`

## Verification Checklist

- `Title` continua funcionando como hoje sem configuração extra
- `Text` continua funcionando como hoje sem configuração extra
- `Ajustar ao conteúdo` permite usar `Icon` e texto lado a lado
- Preset `Título com ícone` funciona sem edição estrutural adicional
- Preset funciona dentro de `Flexbox`
- Preset funciona dentro de `Grid`
- Labels da interface estão em linguagem não técnica
- `npm run lint` passa sem erros

## Open Product Decisions

- O preset principal deve nascer no `TextPanel`, no `FloatingToolbar`, ou nos dois?
- Vale adicionar também `Texto com ícone à direita` já nesta primeira versão?
- O label de árvore deve ser sempre customizado automaticamente ao criar presets?

## Future Follow-Ups

- avaliar componente composto dedicado se o padrão for muito usado
- permitir ícone embutido com posição leading/trailing diretamente no componente de texto
- adicionar mais presets semânticos, como:
  - `Bullet com ícone`
  - `Callout com ícone`
  - `KPI com ícone`
