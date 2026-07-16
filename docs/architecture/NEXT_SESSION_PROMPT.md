# Prompt — Próxima Sessão iPet

> Atualizado em 2026-07-16. O conteúdo anterior (rename Pet Pass, BU Pet Health,
> cards Trello [PH]/[MP]) foi todo entregue — ver commits até fb0945c.

## Estado atual

- **Branch ativa:** `feat/raca-combobox` — PR #18 aberto com toda a evolução desde `main`
- **App canônico:** `apps/web` (Turborepo). `prototipos/responsavel-app` segue independente; migração completa é sprint dedicado
- **Épico sustentabilidade (5 gaps):** 5/5 fechados — estado→Supabase, documentos→Storage, auth gate, Mercado Pago real, analytics→tabela `events`
- **Migrations Supabase:** 001–007 em `prototipos/responsavel-app/supabase/migrations/` (dir compartilhado). 007 = tabela `events` (analytics BML)

## Pendências pra produção (go-live)

1. Aplicar migrations 001–007 no projeto Supabase real + configurar `.env.local` do apps/web (Supabase, service role, `ADMIN_EMAILS`, Mercado Pago, FCM, `CRON_SECRET`)
2. Deploy Vercel + cron diário chamando `/api/push/cron-prazos`
3. Revisão dos sócios no PR #18 (30+ cards em "Em Revisão" no Trello mapeiam pra ele)

## Próximas frentes (Trello)

- **Backlog priorizável:** hardening OCR pra produção (TWD5kX3I), OCR sorologia PDF (oFsivIGg), Pet Health Hub [PH-F1A], compliance de retorno ao Brasil (15feSxTr)
- **Targets calibrados (Parcial 2):** conv >2%/>5%, push >15%, CAC <R$60, NPS ≥50
