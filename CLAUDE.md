# NIDO Support CRM — Invent Money

## Contexto
Sistema interno de suporte pra triagem de tickets da comunidade de trainers da Invent Money. Uso interno: Dollar (admin), Brida (admin), moderadores (agente). Não é público.

## Stack
- Next.js 15 (App Router, TypeScript, Server Components por padrão)
- Supabase (Postgres + Auth + Storage)
- Tailwind + shadcn/ui
- Vercel deploy

## Regras de trabalho
- Menos código > mais código. Não crie abstrações antes da terceira repetição.
- Sem testes, sem storybook, sem docs além de README curto até eu pedir.
- Sem comentários explicando o óbvio. Nomes claros no lugar disso.
- Migrations SQL em `/supabase/migrations`. Uma por feature.
- Server Actions pra mutations. Nada de API routes soltas.
- Antes de instalar uma lib nova, pergunta.
- Antes de mudar schema existente, pergunta.

## Schema (v1)
- `profiles`: id (uuid, ref auth.users), name, role ('admin'|'agent'), created_at
- `tickets`: id, telegram_handle, email, category, description, extra_data, status, assignee_id (fk profiles), created_at, updated_at
- `ticket_attachments`: id, ticket_id, storage_path, filename, mime, size
- `ticket_events`: id, ticket_id, actor_id, kind ('created'|'status_change'|'assigned'|'comment'), payload jsonb, created_at

## Enums
- category: top_up, bonus, cartao, cadastro, kyc, conta_restrita, outro
- status: solicitado, em_andamento, aguardando_cliente, resolvido, fechado

## Design
Referência visual em `design_handoff_crm/` (Claude Design → Modernist system, adaptado com cantos arredondados).
Design manda em tudo — a spec de UI abaixo bate com o `design_handoff_crm/index.html`.

### Paleta (light theme)
- page bg: `#fafbff`
- surface: `#ffffff`
- text: `#201e1d`
- accent: `#ec3013` (vermelho-laranja)
- neutrals 100–900 e accent 100–900: ver `design_handoff_crm/_ds/modernist-*/styles.css`

### Tipografia
- Archivo (400, 600, 800), via Google Fonts
- Headings: weight 800, letter-spacing -0.015em

### Layout
- Sidebar fixa esquerda, 262px, fundo branco, border-radius 0 24px 24px 0, box-shadow soft
  - Logo `invent money` empilhado (money em accent)
  - Nav: Dashboard, Histórico, Suporte, Configurações
  - Item ativo: fundo accent, texto branco, radius 8px
  - Rodapé: card de upgrade + avatar do usuário + linha "Gerenciado por NIDO"
- Main: padding 32/32/32/24, header com título + subtítulo + search 300px + botão de notificações
- Cards: bg branco, border-radius 24px, shadow soft (`0 10px 30px rgba(45,43,43,0.08)`)
- Tabelas: `.table` do sistema, header uppercase 11px, hover leve

## Não fazer (ainda)
- Integração WhatsApp/Telegram
- SLA calculations, first-response tracking
- Email notifications
- Automações
- Multi-tenant

## Repo
https://github.com/notaboutdollar/Suporte-Inventy-money
