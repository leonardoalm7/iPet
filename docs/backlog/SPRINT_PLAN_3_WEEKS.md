# Sprint Plan — MVP Go-Live em 3 Semanas

> **Meta:** Ter paywall funcional + checkout Mercado Pago + paginas publicas LLMO em producao.

---

## Semana 1 — Foundation (Paywall + Paginas Publicas)

| Dia | Story | Tasks | Horas |
|-----|-------|-------|-------|
| D1-D2 | US-1.1 (Paywall) | Tipo `isPremium`, migration Zustand, `calcularRoadmapTeaser()`, `<PaywallBanner />` | 4h |
| D2-D3 | US-1.1 (Paywall) | Condicionar RoadmapView/Timeline, bloquear embarque, analytics | 2.5h |
| D3-D4 | US-2.1 (Regras) | Rota `/regras/[destino]`, loader, slugs, metadata, ISR | 4h |
| D4-D5 | US-2.1 (Regras) | JSON-LD (FAQ+Article), FAQs por destino, estilizacao, CTA | 3.5h |

**Entregavel Semana 1:** App mostra roadmap teaser (sem datas) para free. 12 paginas publicas de regras indexaveis.

---

## Semana 2 — Checkout + SEO Tecnico

| Dia | Story | Tasks | Horas |
|-----|-------|-------|-------|
| D1 | US-1.2 (Checkout) | SDK Mercado Pago, env vars, `/api/checkout/create-preference` | 2.5h |
| D2 | US-1.2 (Checkout) | Pagina `/checkout/[planoId]`, resumo do pedido, botao pagar | 2h |
| D2-D3 | US-1.2 (Checkout) | Webhook IPN, paginas sucesso/erro/pendente | 3.5h |
| D3 | US-1.2 (Checkout) | Atualizar isPremium no Zustand + Supabase, analytics | 1.5h |
| D4 | US-1.3 (Backend) | Tabelas Supabase (pagamentos, planos_viagem), RLS policies | 1h |
| D4-D5 | US-1.3 (Backend) | `payment-service.ts`, sync Zustand ↔ Supabase | 3h |
| D5 | US-2.4 (SEO) | robots.ts, sitemap.ts, noindex em rotas privadas | 1.5h |

**Entregavel Semana 2:** Tutor pode pagar R$ 99 via Mercado Pago e destravar roadmap. SEO tecnico no ar.

---

## Semana 3 — Polish + Lead Magnet

| Dia | Story | Tasks | Horas |
|-----|-------|-------|-------|
| D1 | US-2.2 (Indice) | `/regras/page.tsx` com grid, metadata, ItemList Schema | 2h |
| D1-D2 | US-2.3 (Calculadora) | Form, `calcularDataIdeal()`, resultado visual, CTA | 3.5h |
| D2 | US-2.3 (Calculadora) | Meta tags, analytics, redirect inteligente | 1h |
| D3 | US-1.4 (Ancoragem) | Componente de comparacao de valor, posicionar na UX | 1.5h |
| D4-D5 | QA & Deploy | Testes E2E checkout, teste em sandbox Mercado Pago, deploy Vercel | 4h |

**Entregavel Semana 3:** Calculadora publica, indice de destinos, ancoragem de valor, deploy em producao.

---

## Resumo de Esforco

| Epico | Horas | % do total |
|-------|-------|-----------|
| Epico 1 — TurboTax Paywall & Checkout | ~20h | 53% |
| Epico 2 — LLMO & SEO | ~16h | 42% |
| QA & Deploy | ~4h | 5% |
| **Total** | **~36h** | 100% |

---

## Dependencias Externas

| Dependencia | Responsavel | Bloqueante? | Prazo |
|-------------|-------------|-------------|-------|
| Conta Mercado Pago (vendedor) com Access Token | CEO/COO | SIM — sem isso nao ha checkout | Antes da Semana 2 |
| Dominio ipetpass.com.br (ou similar) | COO | NAO para MVP (pode usar Vercel URL) | Ideal ate Semana 3 |
| Supabase projeto configurado (auth + DB) | CTO/COO | SIM para US-1.3 (persistencia) | Antes da Semana 2 |
| Deploy Vercel (Pro ou Hobby) | COO | SIM para go-live | Antes da Semana 3 |

---

## Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Mercado Pago demora para aprovar conta | Bloqueia checkout | Criar conta AGORA; usar sandbox ate aprovacao |
| Supabase nao configurado a tempo | Sem persistencia | MVP roda com Zustand/localStorage; Supabase pode vir em sprint seguinte |
| Regras de destino desatualizadas nas paginas publicas | Risco reputacional | ISR 24h + badge "verificado em [data]" + disclaimer |
| Tutor paga e nao destravar (bug no webhook) | Churn imediato | Fallback: verificar pagamento via polling apos callback + botao "Ja paguei" manual |

---

## O que NAO esta no escopo (evitar over-engineering)

- Checkout Transparente (cartao no form) — V2
- Assinatura recorrente — descartado por estrategia
- Notificacoes push (Firebase FCM) — sprint seguinte
- Integracao real com clinicas (marketplace) — Fase 2
- Multi-idioma nas paginas publicas — V2
- A/B testing de pricing — apos 100+ usuarios
- Concierge IA (chat) — Fase 2+
