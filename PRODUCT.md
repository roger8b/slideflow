# Slideflow: O Motor Gráfico de Narrativas

Slideflow é uma plataforma de apresentação de próxima geração que substitui o modelo linear de "carrossel" por um motor de narrativa dinâmico, baseado em grafos. Ele permite que os criadores construam ecossistemas interconectados de conteúdo onde a história se adapta às necessidades do público-alvo.

---

## 👁️ Visão de Produto
As apresentações tradicionais são rígidas. O Slideflow trata ideias como **nós (nodes)** em um grafo de conhecimento. Combinando o **React Flow** (para lógica de navegação) e o **Craft.js** (para precisão visual micro), o Slideflow capacita os usuários a criar histórias complexas, ramificadas, e que podem ser exploradas interativamente com flexibilidade de layout extremo.

## 🏗️ Arquitetura Técnica

### 1. O Motor de Núcleo Duplo
- **Macro-Nível (React Flow):** Gerencia a topologia da apresentação. Ele lida com as transições de slides, lógica de ramificações (bifurcações) e o relacionamento espacial entre as ideias.
- **Micro-Nível (Craft.js):** Um editor *drag-and-drop* de alta performance embutido em cada nó. Ele serializa o conteúdo do slide em uma estrutura JSON encadeada, permitindo altíssima flexibilidade no design do layout de cada peça de conteúdo.
- **Padronização de Tela (Canvas):** Os slides são travados em uma **proporção 16:9 (960x540)** para assegurar a consistência visual da renderização em diferentes modos de visualização e exportação.

### 2. Design Aumentado por IA (Gemini 2.5)
O sistema integra a API de **Google Gemini 2.5 Flash** para preencher o vazio entre o design e a criação de conteúdo com inteligência de layout estruturada e adaptável.
- **Engenharia de Prompt:** Utiliza prompts de sistema sofisticados para traduzir comandos de linguagem natural em árvores de componentes estruturados do Craft.js.
- **Percepção e Consciência de Contexto:** A inteligência artificial entende os princípios estéticos da página e os aplica de forma inteligente usando contêineres e configurações flexíveis de *Flexbox*.

### 3. Sistema de Estilos Reativos (Reactive Styling)
A arquitetura do Slideflow possui um sistema e motor de temas centralizados que performa de maneira recursiva sob estados do Craft.js atualizados em tempo real.
- **Tokens Globais (Global Tokens):** Injetam paletas de cores globais, tipografia de base (incluindo famílias de fontes customizadas) e constantes de layout espacial de contêineres (`gap`, espaçamento interno `padding`, margens, etc.) através do escopo geral da apresentação.
- **Modal e Customização de Temas:** Permite aos usuários o preview e visualização das aplicações de estilos pré-montados ou pré-definidos quase de maneira instantânea e integrada.

---

## 🛠️ Conjunto Detalhado de Funcionalidades

### 🎨 O Editor Visual (Modo de Criação)
- **Editor de Nós (Nodes) Unificados:** Todos os slides aplicam um editor de altíssimo nível, removendo nós ou *nodes* legados que só exerciam um papel restrito.
- **Painel de Componentes:** Possibilidade de *drag-and-drop* para Título, Textos, (ambos suportam propriedades *Markdown* estendidas), Imagens e componentes de Grade (Grid).
- **Barra de Ferramentas Flutuantes e Camadas (Layers):** Apresenta uma interface (UI) modernizada que inclui a barra de ferramentas flutuante que fornece respostas interativas na página ou um modo de árvore (*tree layer view*) onde facilita os detalhes complexos de gerenciamento interno.
- **Controles Profundos de *Flexbox*:** Oferece um refinado controle para alinhamento dos contentores e da distribuição, tanto das alturas (comportamentos computados estáticos, fluídos) bem como propriedades como espaçamento (Gaps e Paddings).
- **Efeitos de Texto:** Controles específicos de tipografia, sombras e preenchimentos.

### ⚡ Inteligência & Automação Produtiva
- **Gerador de Layout por IA:** Usa um design de layout que tem integração embarcada via sidebar para instanciar blocos prontos através de comandos textuais rápidos.
- **Blocos Reutilizáveis (Reusable Blocks):** Capacidade avançada de exportar / salvar customizações completas de árvores do editor que podem ser acionadas e restauradas posteriormente para impulsionar e economizar tempo produtivo.
- **Teclas de Atalhos:** Optimizadas para produtividade e com um largo escopo de chaves curtas para controle e edição eficientes de acessibilidade (atalhos diretos).

### 📽️ A Experiência do Player (Modo de Apresentação)
- **Visualização Imersiva:** Modo tela cheia renderizado e flexível às proporções das bases do projeto, sendo escalável via font-size base configurável.
- **Navegação de Natureza Não Linear:** Navegue através dos atalhos "Próximo / Voltar" ou acione lógicas pontuais ao acionar opções com interconexões a rotas adjacentes (bifurcações de escolhas de conteúdo de grafo).
- **Transições e Orquestrações Vivas:** Uma integração complexa entre o motion/react (Framer) ativada e controlando nós para as exibições interconectadas dos caminhos.

---

## 📄 Evolução & Histórico (Marcos do Projeto)

O caminho traçado pelo Slideflow concentrou a base e seu valor a cada iteração técnica ou estrutural:

- **Fase 1: Fundação:** Adoção de ambos **Craft.js** e **React Flow** para as áreas de construção estrutural.
- **Fase 2: Padronização do Fator de Forma:** Implantação e fixação em torno da matriz de dimensões **16:9** do Canvas para todas as edições visuais para controle completo sem falhas dos layout.
- **Fase 3: Incremento de Conteúdos:** Acréscimo do interpretador de suporte em base ao **Markdown** junto ao componente tipográfico associado às lógicas modulares nativas em painéis ou fluxos com as caixas textuais.
- **Fase 4: Identidade Avançada e Implementações baseadas no Gemini (IA):** Integração finalizada das inteligências baseadas pela estrutura em prompt generativo no Google AI com a liberação global das paletas e **Sistema de Tema Global**.
- **Fase 5: Modernizações Finas e Refinamentos Baseados em Experiência do Autor:** Modernizou a interação interna lançando o recurso aprimorado da **Barra de Tarefas Flutuantes de Camadas (Layers)**, da barra modular (*floating toolbar*) em cada interação contextual aprimorando substancialmente e abrindo campo limpo às opções.
- **Fase 6: Opções Flexbox a Nível Produção:** Renovação sistemática das tabelas interativas das identidades dos Brand Kits (Kits Globais Base de Marca). Atualizações para controle manual e visual (Texto de contraste e caixas duplas configuráveis nos background base). Refino complexo estabilizando Flexbox para design-time contra presentation mode render final.
- **Fase 7: Efeitos de Texto: Introdução de efeitos textuais granulares e barra lateral (sidebar) focada no controle central e intuitivo das formatações gráficas aos atributos Texto/Título e dos nós do Craft.**

---

## 📄 Estrutura Arquitetural de Dados Internos (`.slideflow.json`)

Para que tudo converta sem vazamentos de formato ou padrões, os nodes se comunicam padronizados a um modelo em árvore que empacota todas as diretrizes por dentro do Node de Topologia e a topologia é persistida por completo:

```json
{
  "metadata": {
    "title": "Estratégia 2026",
    "theme": "modern",
    "baseFontSize": 32,
    "createdAt": "2026-03-14T..."
  },
  "nodes": [
    {
      "id": "node_1",
      "data": {
        "label": "Introdução",
        "layout": "{ \"ROOT\": { \"type\": \"Container\", \"props\": { ... } } }"
      }
    }
  ],
  "edges": [
    { "source": "node_1", "target": "node_2", "markerEnd": { "type": "arrowclosed" } }
  ]
}
```

---
*Versão do Documento: 1.3 | Atualizado baseado no Histórico de Commit | Março 2026*