# PLAN: Figma-like UI Refactoring & Reorganization

## Contexto & Objetivos
- **Objetivo Central:** Refatorar a interface do editor (Craft.js + React Flow) para se assemelhar estruturalmente e visualmente ao Figma.
- **Princípio:** O Figma distribui as responsabilidades espaciais de forma muito específica. A esquerda é para *Navegação Estrutural*, o centro inferior (ou superior esquerdo) é para *Ferramentas*, e a direita é *exclusivamente para Propriedades de Design*. O contraste é mínimo (muito branco e cinza claro) para destacar o Canvas.

---

## �️ Phase 1: Reorganização Estrutural (O Padrão Figma)

Nossa UI atual mistura ferramentas de criação com bibliotecas na esquerda, e arvore de camadas com configuração de design na direita. Vamos reestruturar os componentes React para imitar o padrão ouro:

1.  **Panel Esquerdo (Navegação):**
    *   **Remover:** O gerador de IA e a paleta de ferramentas puras (Text, Container, etc.) daqui.
    *   **Mover para cá:** A `LayersTree` (Árvore de Camadas) que criamos hoje será movida do painel direito para ser a aba principal permanente do painel esquerdo.
    *   **Abas do Painel Esquerdo:** "Layers" | "Assets" (onde ficarão os Saved Blocks).

2.  **Barra Flutuante Central (Ferramentas de Criação):**
    *   **Criar:** Um novo componente flutuante (`FloatingToolbar.tsx`) fixado na parte inferior central da tela (ou superior central).
    *   **Conteúdo:** Conterá os botões minimalistas para arrastar elementos primitivos para o quadro (Icone de Texto (T), Icone de Imagem, Icone de Container/Frame, ícone de IA).

3.  **Panel Direito (Design Properties):**
    *   **Remover:** A aba de "Layers" daqui.
    *   **Objetivo:** Será um painel *exclusivo* para as propriedades da seleção atual.
    *   **Abas reestruturadas:** As abas "Layout", "Style" e "Config" serão mescladas em uma rolagem vertical limpa com seções expansíveis (Accordions: "Layout", "Typography", "Fill", "Stroke", "Effects"), exatamente como no Figma, eliminando as abas horizontais que consomem espaço ali em cima.

---

## 🎨 Phase 2: Estética Visual (Restraint is Luxury)

1. **Paleta Ultra-Neutra e Monocromática:** Quase toda a UI será Branca (`#FFFFFF`) ou Cinza levíssimo (`#F5F5F5`).
2. **Bordas finas (1px):** As separações entre painéis e seções usarão o cinza mais sutil possível (`#E5E5E5`). Sem sombras pesadas para os painéis fixos.
3. **Canvas:** O fundo onde os blocos ficam no Craft será um cinza claro neutro (`bg-gray-100`), fazendo os containers brancos *avançarem* ("pop up") da tela, parecendo Artboards verdadeiros.
4. **Tipografia Densa:** Reduziremos os paddings atuais dos campos do SettingsPanel e diminuiremos a fonte dos labels para `text-[10px]` ou `text-[11px]`, garantindo que muitos controles caibam na tela sem precisar de *scrolls* infinitos.
5. **Accent Color Profissional:** Onde for necessário indicar algo ativo (aba do painel esquerdo, ícone flutuante selecionado, árvore de camadas ativa), usaremos um azul exato e sem tons roxos (ex: `#0D99FF` ou `blue-500` do Tailwind).

---

## ⚠️ Próprios Passos & Alinhamento
A reestruturação vai alterar os componentes:
- `App.tsx` / `EditorContainer.tsx` (para reorganizar o grid e injetar a toolbar flutuante).
- `SidebarPalette.tsx` (refeita para ser a barra esquerda apenas com Layers e Assets).
- `SettingsPanel.tsx` (refeita para ser o painel denso de propriedades).

Posso dar andamento na Phase 1 (Reorganização Estrutural profunda)?
