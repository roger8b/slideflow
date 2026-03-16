<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Slideflow: The Narrative Graph Engine

O **Slideflow** é uma plataforma inovadora para criação de apresentações que substitui o formato de carrossel linear por um motor de narrativas baseado em grafos e uma topologia espacial das ideias. Permite aos criadores desenvolverem ecossistemas interconectados de conteúdo onde as histórias se adaptam dinamicamente às necessidades do público.

O projeto é construído principalmente com:
* **React Flow**: Para a construção do mapa da apresentação (a macro-estrutura de navegação).
* **Craft.js**: Como motor visual embutido em cada node (slide) (para montar a micro-estrutura com *drag-and-drop*).
* **Vite** e **React**: Garantindo agilidade no desenvolvimento.
* **Tailwind CSS**: Para a estilização flexível dos componentes da interface.
* **Google Gemini 2.5 Flash**: A API do Gemini é utilizada para empoderar a Geração de Layout com IA.

Visualize uma demo no AI Studio: https://ai.studio/apps/b609b949-e583-4d7a-a33a-3b73128d5305

## Executando Localmente

**Pré-requisitos:** Node.js instalado (versão suportada atual recomendada via npm ou nvm).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Defina a chave do **Gemini API** no arquivo `.env` ou `.env.local` copiando do exemplo:
   ```bash
   cp .env.example .env.local
   ```
   E atualize a variável `GEMINI_API_KEY=sua_chave_aqui` no arquivo.
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para a verificação de código, rode o linter:
   ```bash
   npm run lint
   ```
5. Para gerar uma build otimizada de produção:
   ```bash
   npm run build
   ```
