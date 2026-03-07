# PLAN-layout-evolution.md - SlideFlow Layout Evolution

Refinamento do editor de layout para suportar templates pré-definidos, imagens de fundo e estilos visuais avançados.

---

## 📅 Resumo do Projeto
- **Objetivo**: Transformar o simulador de layout em uma ferramenta produtiva com templates e design premium.
- **Prioridade**: Estruturas de Layout > Imagens de Fundo > Estilização (Presets + Custom).
- **Tech Stack**: React, Craft.js, Lucide-Icons, TailwindCSS.

---

## 🛠️ Fase 1: Biblioteca de Layouts (Templates)
*Foco na agilidade de criação com estruturas prontas.*

- [ ] **Componente `SidebarPalette`**:
    - [ ] Criar nova seção "Layout Templates".
    - [ ] Implementar botões que, ao serem arrastados/clicados, inserem uma estrutura aninhada de elementos.
- [ ] **Templates Específicos**:
    - [ ] **Capa**: Container centralizado com Título grande e Subtítulo (Text).
    - [ ] **Índice**: Container com Título e Grid de lista numerada/tópicos.
    - [ ] **Título + Container**: Layout padrão com cabeçalho e área de conteúdo flexível.
    - [ ] **Título + 2 Colunas**: Grid horizontal com duas colunas de mesma largura.
    - [ ] **Título + 3 Colunas**: Grid horizontal com três colunas proporcionais.

---

## 🖼️ Fase 2: Imagens de Fundo em Containers
*Liberdade visual para criar slides imersivos.*

- [ ] **Componente `Container`**:
    - [ ] Adicionar suporte a `backgroundImage`, `backgroundSize` (cover/contain), e `backgroundPosition`.
    - [ ] Estilizar para garantir que o conteúdo sobreposto (Texto/Imagens) continue legível.
- [ ] **`SettingsPanel`**:
    - [ ] Adicionar campo de URL para Imagem de Fundo no seletor de Container.
    - [ ] Adicionar controle de "Filtro de Escurecimento" (Overlay) para melhorar o contraste do texto sobre a imagem.

---

## 🎨 Fase 3: Estilização Visual (Design Premium)
*Controle de acabamento e estética.*

- [ ] **Presets de Estilo**:
    - [ ] Implementar botões de atalho: "Soft Card" (Sombra suave, borda arredondada), "Glassmorphism" (Fundo semi-transparente, blur), "Outlined".
- [ ] **Controle Customizado (Avançado)**:
    - [ ] Adicionar seção colapsável no `SettingsPanel` para controle granular.
    - [ ] **Border Radius**: Slider para arredondamento de cantos.
    - [ ] **Box Shadow**: Seletores de intensidade de sombra.
    - [ ] **Border**: Cor e espessura da borda.

---

## ✅ Lista de Verificação (Verificação)

- [ ] Os layouts pré-definidos são inseridos com a hierarquia correta de Craft.js?
- [ ] A imagem de fundo do container é responsiva ao tamanho do slide (960x540)?
- [ ] A troca entre predefinições de estilo e controles customizados é fluida?
- [ ] O contraste de texto em Containers com Imagem de Fundo é garantido pelos overlays?

---

## 👥 Atribuições de Agentes
- **Frontend Specialist**: Implementação dos componentes Craft.js e estilização.
- **Project Planner**: Monitoramento da integração dos templates.
- **UX Specialist**: Auditoria da facilidade de uso do novo painel de estilos.
