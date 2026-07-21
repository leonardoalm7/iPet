# EPIC 01 — Modelo TurboTax (Paywall & Checkout)

> **Objetivo:** Separar a experiencia gratuita da paga e integrar o gateway Mercado Pago para cobrar R$ 99 pelo iPet Travel Plan por viagem.

---

## Contexto Tecnico Atual

- `PlanoViagem` em `domain/types.ts` nao tem campo `isPremium`
- `calcularRoadmap()` em `travel-roadmap.ts` retorna todas as tarefas com datas — sem filtragem free/premium
- `app-store.ts` (Zustand) persiste em localStorage — sem integracao Supabase
- Nao existe nenhuma tela de checkout, pagamento ou paywall
- `CustoEstimado.tsx` mostra estimativa informativa (sem acao de compra)

---

## US-1.1: Paywall no Roadmap (Free vs Premium)

**Como** tutor que selecionou um destino,
**eu quero** ver a lista de exigencias do pais (a "montanha"),
**para que** eu entenda a complexidade e decida se vale pagar pelo roadmap completo.

### Criterios de Aceite

```gherkin
Given um tutor com pet cadastrado que seleciona destino "Portugal" e data de embarque
When o roadmap e gerado
Then ele ve a lista de tarefas (microchip, vacina, sorologia, CVI) com icones e descricao
  And as datas retroativas estao ocultas (placeholder "---" ou icone de cadeado)
  And o status dinamico (URGENTE, CRITICO, VENCIDA) esta oculto
  And um banner "Destravar Roadmap Completo — R$ 99" e exibido no topo da lista
  And o checklist de embarque esta bloqueado com overlay premium
```

```gherkin
Given um tutor que ja pagou o Travel Plan para este plano de viagem
When ele acessa o roadmap
Then todas as datas, status e checklist estao visiveis
  And o banner de paywall nao aparece
  And notificacoes push estao ativas para este plano
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Adicionar `isPremium: boolean` e `pagamentoId?: string` ao tipo `PlanoViagem` em `domain/types.ts` | `domain/types.ts` | 15min |
| 2 | Criar migration Zustand (version 1→2) para default `isPremium: false` nos planos existentes | `store/app-store.ts` | 30min |
| 3 | Criar funcao `calcularRoadmapTeaser()` que retorna tarefas sem datas e sem status dinamico | `services/travel-roadmap.ts` | 1h |
| 4 | Criar componente `<PaywallBanner />` com CTA "Destravar — R$ 99" | `components/PaywallBanner.tsx` | 1h |
| 5 | Condicionar `<RoadmapView>` e `<RoadmapTimeline>` para renderizar teaser vs completo baseado em `isPremium` | `components/RoadmapView.tsx`, `RoadmapTimeline.tsx` | 1.5h |
| 6 | Bloquear rota `/embarque/[planoId]` com redirect para paywall se `!isPremium` | `app/embarque/[planoId]/page.tsx` | 30min |
| 7 | Adicionar evento analytics `track("paywall_exibido")` e `track("paywall_clicado")` | `services/analytics.ts` | 15min |

---

## US-1.2: Tela de Checkout (Mercado Pago)

**Como** tutor que decidiu comprar o Travel Plan,
**eu quero** pagar de forma segura via Pix, cartao ou boleto,
**para que** meu roadmap seja destravado imediatamente.

### Criterios de Aceite

```gherkin
Given um tutor que clicou "Destravar Roadmap"
When a tela de checkout carrega
Then ele ve um resumo do pedido:
  | Campo | Valor |
  | Pet | Nome do pet |
  | Destino | Bandeira + nome do pais |
  | Embarque | Data selecionada |
  | Produto | iPet Travel Plan |
  | Valor | R$ 99,00 |
  And um botao "Pagar com Mercado Pago" esta visivel
```

```gherkin
Given o tutor clicou "Pagar com Mercado Pago"
When ele e redirecionado ao Checkout Pro do Mercado Pago
Then a preferencia de pagamento contem:
  | Campo | Valor |
  | title | iPet Travel Plan — {destino} |
  | unit_price | 99.00 |
  | currency_id | BRL |
  | external_reference | planoViagem.id |
  And metodos disponiveis: Pix, cartao de credito, boleto
```

```gherkin
Given o pagamento foi aprovado no Mercado Pago
When o tutor retorna ao app via URL de callback
Then o plano de viagem e marcado como isPremium = true
  And o pagamentoId e salvo no plano
  And uma tela de confirmacao "Roadmap destravado!" e exibida
  And o tutor e redirecionado automaticamente ao roadmap completo
```

```gherkin
Given o pagamento foi recusado ou cancelado
When o tutor retorna ao app
Then uma mensagem de erro e exibida
  And o plano permanece isPremium = false
  And o tutor pode tentar novamente
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar rota `/api/checkout/create-preference` (Route Handler Next.js) que cria preferencia no Mercado Pago | `app/api/checkout/create-preference/route.ts` | 2h |
| 2 | Instalar SDK `mercadopago` e configurar credenciais via env vars (`MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`) | `package.json`, `.env.local` | 30min |
| 3 | Criar pagina `/checkout/[planoId]/page.tsx` com resumo do pedido e botao de pagamento | `app/checkout/[planoId]/page.tsx` | 2h |
| 4 | Criar rota `/api/checkout/webhook` para receber notificacoes IPN do Mercado Pago | `app/api/checkout/webhook/route.ts` | 2h |
| 5 | Criar pagina `/checkout/sucesso/page.tsx` e `/checkout/erro/page.tsx` (callbacks) | `app/checkout/sucesso/page.tsx`, `app/checkout/erro/page.tsx` | 1.5h |
| 6 | Atualizar `isPremium` e `pagamentoId` no Zustand + Supabase apos confirmacao | `store/app-store.ts`, `services/payment-service.ts` | 1.5h |
| 7 | Adicionar eventos analytics: `track("checkout_iniciado")`, `track("pagamento_aprovado")`, `track("pagamento_recusado")` | `services/analytics.ts` | 15min |

---

## US-1.3: Gestao de Status Premium no Backend

**Como** sistema,
**eu quero** persistir o status de pagamento por plano de viagem no Supabase,
**para que** o estado premium sobreviva a troca de dispositivo e limpeza de cache.

### Criterios de Aceite

```gherkin
Given um tutor que pagou pelo Travel Plan no dispositivo A
When ele faz login no dispositivo B
Then o plano de viagem aparece como isPremium = true
  And o roadmap completo esta acessivel
```

```gherkin
Given um webhook do Mercado Pago com status "approved"
When o endpoint /api/checkout/webhook processa a notificacao
Then a tabela planos_viagem e atualizada com is_premium = true e pagamento_id
  And o evento e registrado na tabela pagamentos para auditoria
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar tabela `pagamentos` no Supabase (id, plano_viagem_id, mp_payment_id, status, valor, metodo, created_at) | SQL migration | 30min |
| 2 | Adicionar colunas `is_premium` e `pagamento_id` na tabela `planos_viagem` | SQL migration | 15min |
| 3 | Criar RLS policies: usuario so ve/edita seus proprios planos e pagamentos | SQL migration | 30min |
| 4 | Criar `services/payment-service.ts` com funcoes `criarPreferencia()`, `processarWebhook()`, `verificarPagamento()` | `services/payment-service.ts` | 2h |
| 5 | Sincronizar estado Zustand ↔ Supabase no login (hidratar `isPremium` do banco) | `store/app-store.ts` | 1h |

---

## US-1.4: Ancoragem de Valor na UX

**Como** tutor na tela de destino,
**eu quero** ver uma comparacao de custo (despachante vs iPet Pass),
**para que** eu perceba o valor do Travel Plan antes de chegar ao paywall.

### Criterios de Aceite

```gherkin
Given um tutor na tela de selecao de destino
When ele seleciona um pais e ve a "montanha" de exigencias
Then um badge discreto exibe "Despachantes cobram R$ 5.000+. iPet Travel Plan: R$ 99"
  And o badge nao bloqueia o conteudo (e informativo, nao intrusivo)
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar componente `<AncoragemValor />` com comparacao visual despachante vs iPet | `components/AncoragemValor.tsx` | 1h |
| 2 | Posicionar abaixo da lista de regras do destino na tela de viagem | `app/viagem/[petId]/page.tsx` | 30min |

---

## Prioridade de Execucao (Epico 1)

| Ordem | Story | Justificativa | Sprint |
|-------|-------|---------------|--------|
| 1 | US-1.1 | Sem paywall nao ha conversao — e pre-requisito de tudo | Semana 1 |
| 2 | US-1.2 | Checkout e a monetizacao — sem isso nao ha receita | Semana 1-2 |
| 3 | US-1.3 | Persistencia garante confianca — tutor nao perde acesso | Semana 2 |
| 4 | US-1.4 | Ancoragem de valor aumenta conversao — otimizacao | Semana 2-3 |

**Estimativa total Epico 1:** ~20h de desenvolvimento

---

## Decisoes Tecnicas

### Por que Checkout Pro (redirect) e nao Checkout Transparente?

| Aspecto | Checkout Pro | Checkout Transparente |
|---------|-------------|----------------------|
| Tempo de integracao | 1-2 dias | 1-2 semanas |
| PCI Compliance | Mercado Pago assume | Voce assume |
| Metodos de pagamento | Pix, cartao, boleto automatico | Precisa implementar cada um |
| UX | Redirect (sai do app) | In-app (melhor UX) |
| **Recomendacao MVP** | **SIM** | Nao (V2) |

### Fluxo de Checkout (Diagrama)

```
Tutor ve roadmap teaser
    |
    v
[PaywallBanner] "Destravar — R$ 99"
    |
    v
/checkout/[planoId] (resumo do pedido)
    |
    v
POST /api/checkout/create-preference
    |
    v
Redirect → Mercado Pago Checkout Pro
    |
    ├── Aprovado → /checkout/sucesso?planoId=X&payment_id=Y
    |                   |
    |                   v
    |               Marca isPremium=true
    |               Redirect → /viagens/[planoId] (roadmap completo)
    |
    ├── Pendente → /checkout/pendente (aguardando Pix/boleto)
    |                   |
    |                   v
    |               Webhook IPN confirma → atualiza isPremium
    |
    └── Recusado → /checkout/erro (tenta novamente)
```
