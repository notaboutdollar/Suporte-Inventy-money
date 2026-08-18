# Handoff: CRM Invent Money

## Overview
Dashboard de CRM para a Invent Money (gerido pela NIDO). Protótipo clicável com 4 telas: Dashboard, Histórico, Suporte, Configurações.

## About the Design Files
O arquivo `index.html` é uma **referência de design** feita em HTML/React (Design Component) — não é código de produção para copiar direto. A tarefa é **recriar esse design** no ambiente/stack real do projeto (React, Vue, etc.), usando os padrões já existentes no codebase. Ele roda standalone no navegador (abra `index.html`) só para visualização/inspeção.

## Fidelity
**High-fidelity**: cores, tipografia, espaçamento e conteúdo estão definidos como no protótipo final. Recrie pixel a pixel, adaptando aos componentes/libs já usados no codebase alvo.

## Telas

### 1. Dashboard (tela inicial)
- Sidebar fixa esquerda (262px), fundo branco, cantos arredondados à direita (24px), sombra suave.
  - Logo "invent money" (quadrado laranja 36px + wordmark Archivo bold, "money" em laranja).
  - Nav: Dashboard, Histórico, Suporte, Configurações — item ativo com fundo laranja sólido e texto branco, ícones Lucide-style à esquerda, chevron à direita.
  - Card de upgrade (laranja sólido, cantos 20px, texto branco, botão branco).
  - Perfil do usuário (avatar iniciais "AM", nome, cargo).
  - Rodapé discreto "Gerenciado por NIDO".
- Header: título da página + saudação, campo de busca (pill, fundo branco, sombra), botão de notificação.
- Cards de métricas: Faturamento (R$ 89.400, +14,6%), Clientes ativos (1.284, +8,2%), Ticket médio (R$ 293, -1,4%) — ícone circular + número grande Archivo bold.
- Gráfico de barras "Faturamento mensal" (12 meses, barra de julho destacada em laranja com tooltip).
- Donut chart "Clientes" por plano (Business 62%, Starter 22%, Trial 16%).
- Tabela "Últimas transações": Cliente, Produto, Data, Valor, Status (tags Pago/Pendente/Cancelado).

### 2. Histórico
- Lista de atividades recentes (login, faturas, cadastros, alterações), linha a linha com timestamp à direita.

### 3. Suporte
- 3 cards de canal (E-mail, Telefone, Chat) com ícone, título, descrição.
- FAQ em lista com pergunta em negrito + resposta.

### 4. Configurações
- Formulário de Perfil (nome, e-mail, telefone, cargo).
- Formulário de Empresa (nome, CNPJ, segmento).
- Notificações (3 toggles segmentados: e-mail, faturamento, resumo semanal).
- Bloco "Gerenciamento" citando a NIDO como operadora da conta.
- Botões Salvar/Cancelar.

## Interações & Comportamento
- Navegação client-side entre as 4 telas via clique nos itens do menu lateral (SPA, sem reload).
- Item de nav ativo muda de estilo (fundo laranja + texto branco) conforme a tela atual.
- Sem chamadas de API — todos os dados são fictícios/estáticos.

## Design Tokens
Sistema de design "Modernist" (adaptado com cantos arredondados a pedido do cliente):
- Cor de acento: laranja (`--color-accent` e ramp `--color-accent-100…900`)
- Texto: `--color-text`, fundo de página `#fafbff`
- Fonte: Archivo (heading e body), pesos 400/600/800
- Radius customizado: cards 24px, inputs/botões 8-12px, avatares/pills 999px
- Sombra: `0 10px 30px rgba(45,43,43,0.08)` em cards e sidebar
- Espaçamento: escala `--space-2` a `--space-8` do design system Modernist

Tokens completos em `_ds/modernist-*/styles.css`.

## Assets
- Sem imagens externas — ícones inline SVG (estilo Lucide), avatares como iniciais.
- Logo Invent Money: bloco laranja + wordmark tipográfico (sem arquivo de logo real ainda).
- Marca "NIDO": texto + quadrado sólido (placeholder, sem logo real).

## Files
- `index.html` — protótipo completo (4 telas), self-contained exceto pela pasta `_ds/`.
- `_ds/` — tokens e componentes do design system usados (styles.css tem as variáveis CSS).
- `support.js` — runtime do protótipo (não é necessário portar para produção).
