# PLAN-layout-evolution-pro.md: Sistema de Layout e Design Pro-Max

Este plano detalha a implementação das Opções A (Smart Layout), B (Customização Pro) e C (Biblioteca de Templates) para o Slideflow, elevando o editor a um nível profissional de design.

## 🏗️ Decisões Estratégicas (Fase 1)

1.  **Persistência (Arquitetura):** Criaremos um campo `styleProps` dedicado em [src/types.ts](file:///Users/roger.silva/Downloads/slideflow/src/types.ts) para cada nó. Isso separa o *conteúdo* (texto, url da imagem) do *visual* (padding, bordas, sombras).
2.  **Abordagem de Templates:** Implementaremos um sistema híbrido: "Seções Arrastáveis" para estrutura e "Presets de Estilo" para aplicabilidade rápida.
3.  **UI do Editor:** Organização em abas no painel lateral: **Layout**, **Estilo** e **Configurações**.
4.  **Prioridade:** Começaremos pela **Opção A (Smart Layout)** para garantir robustez estrutural, seguida pela **Opção B** para o polimento visual, e finalizando com a **Opção C** para produtividade.

---

## 📅 Marco 1: Smart Layout & Auto-Layout (Opção A)
*Foco: Robustez e alinhamento do conteúdo.*

- [x] **A.1: Refatoração do `Container` Selector:**
    - Adicionar controles de `flex-direction`, `gap`, `padding` e `justify-content`.
    - Implementar visualização em tempo real das margens de segurança.
- [x] **A.2: Lógica de Empilhamento Inteligente:**
    - Garantir que o conteúdo dentro de colunas se ajuste proporcionalmente ao redimensionar.
- [x] **A.3: Baseline de Grid:**
    - Opção de ativar um grid visual para facilitar o posicionamento manual (quando não usar auto-layout).

---

## 🎨 Marco 2: Design Tokens & Customização Pro (Opção B)
*Foco: Estética Premium (Glassmorphism, Sombras, Bordas).*

- [x] **B.1: Painel de Estilo Avançado:**
    - Controles de: `border-radius`, `box-shadow` (presets), e `opacity`.
- [x] **B.2: Backgrounds de Seção:**
    - Suporte a Gradientes Lineares/Radiais e Imagens com overlay de cor.
- [x] **B.3: Glassmorphism Engine:**
    - Implementar switch para `backdrop-filter: blur()`, permitindo efeitos de vidro modernos.
- [x] **B.4: Presets de Tipografia (Design Tokens):**
    - Criar tokens globais (H1, H2, Body) que podem ser alterados em um único lugar e refletidos em todo o slide.

---

## 📚 Marco 3: Templates & Productivity (Opção C)
*Foco: Velocidade de montagem.*

- [x] **C.1: Biblioteca de Seções (Drag & Drop):**
    - Criar 5 templates iniciais: Hero, 3-Columns Features, Text-Image Split, Checklist, e Footer.
- [x] **C.2: Galeria de Presets de Estilo:**
    - Botão de "Aplicar Tema" que altera cores e fontes de todo o slide de uma vez.
- [x] **C.3: Sistema de Preview de Template:**
    - Miniaturas visuais das seções antes de o usuário arrastar para o editor.

---

## 🛠️ Checklist de Verificação (Fase X)

1. **Responsividade:** O layout inteligente se ajusta corretamente em diferentes tamanhos de container?
2. **Performance:** O uso de `backdrop-filter` e sombras pesadas afeta o scroll do editor?
3. **Persistência:** Todas as novas propriedades são salvas e carregadas corretamente do JSON de estado?
4. **UX:** As abas no painel lateral são intuitivas e reduzem a desordem visual?

---

## 🤖 Atribuições de Agentes

- `frontend-specialist`: Implementação de UI/UX nas abas e presets de estilo.
- `orchestrator`: Lógica de refatoração do [src/types.ts](file:///Users/roger.silva/Downloads/slideflow/src/types.ts) e garantia de integridade entre os seletores.
- `debugger`: Testes de clipping e performance dos novos efeitos visuais.

---

**Próximos Passos:**
1. Iniciar **Marco 1** com a atualização das `types.ts`.
2. Criar a interface de Abas no painel de controle.
