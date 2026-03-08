# PLAN-ai-layout-gen: Geração de Layout com Gemini AI

Este plano detalha a implementação de um recurso de IA que transforma prompts de texto em layouts estruturados para slides (Craft.js) dentro do Slideflow.

## 📝 Visão Geral
Adicionar um botão "✨ Inteligência Artificial" no editor de slides que permite ao usuário descrever o conteúdo do slide. O Gemini processará o texto e gerará uma estrutura de componentes (Container, Title, Text) pronta para uso.

---

## 🛠️ Fase 1: Fundação do Serviço de IA
Integrar o SDK do Gemini no frontend e definir o contrato de dados.

- [ ] **Configuração do Cliente:** Criar um utilitário em `src/lib/gemini.ts` para inicializar o `GoogleGenerativeAI` usando a chave do `.env`.
- [ ] **Engenharia de Prompt:** Desenvolver um System Prompt que instrua o Gemini a retornar um JSON compatível com a estrutura de serialização do Craft.js.
- [ ] **Definição de Tipos:** Atualizar `src/types.ts` se necessário para o payload da IA.

---

## 🎨 Fase 2: Interface do Usuário (UI)
Adicionar os pontos de entrada para a IA no editor.

- [ ] **Componente "AI Generator":** Criar um modal simples ou seção na barra lateral para entrada de texto do usuário.
- [ ] **Botão de Ação:** Integrar o botão no `EditorContainer.tsx` ou `SidebarPalette.tsx`.
- [ ] **Estado de Carregamento:** Implementar feedback visual (skeleton ou spinner) enquanto a IA "pensa".

---

## 🧠 Fase 3: Lógica de Mapeamento e Deserialização
Transformar a resposta da IA em elementos reais no canvas.

- [ ] **Mapeador de Layout:** Criar função para converter a resposta JSON do Gemini para o formato esperado pelo `query.deserialize()` do Craft.js.
- [ ] **Injeção de Node:** Implementar a lógica para limpar o canvas atual (opcional) e injetar os novos componentes gerados.
- [ ] **Tratamento de Erros:** Validar se a resposta da IA é um JSON válido antes de tentar aplicar ao editor.

---

## ✨ Fase 4: Polimento e UX
Garantir que a experiência seja fluida.

- [ ] **Melhoria Incremental:** Permitir que o usuário adicione o layout gerado ao final do conteúdo existente em vez de sempre substituir.
- [ ] **Sugestões Rápidas:** Oferecer prompts comuns (ex: "Crie um slide de introdução com 2 colunas") para facilitar o uso.
- [ ] **Verificação de Segurança:** Garantir que o `GEMINI_API_KEY` seja lido de forma segura (frontend environment variables).

---

## ✅ Critérios de Aceite
1. O usuário abre o editor de um slide.
2. Clica no botão de IA e digita "Um título de boas-vindas e 3 tópicos sobre produtividade".
3. A IA retorna os componentes `Title` e `Text` organizados em um `Container`.
4. O layout aparece instantaneamente no editor Craft.js.
5. O estado do nó no ReactFlow (macro) é atualizado após salvar.

## 👥 Atribuições
- **Frontend/IA:** `@frontend-specialist`
- **Lógica de Estado:** `@orchestrator`
