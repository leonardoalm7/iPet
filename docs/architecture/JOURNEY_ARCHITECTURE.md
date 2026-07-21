# iPet — Arquitetura da Jornada do Responsável
**Versão:** 1.1 | **Autores:** Danielle Moreira (CEO), Victor Hugo Telles (CTO), Brunna Rosa (CPO), Leonardo Braga de Almeida (COO) | **Data:** 2026-04-24

> **Insight fundacional:** O usuário não sabe por onde começar. Saber o que precisa fazer não é suficiente — ele precisa ver a jornada completa, entender onde está, o que vem a seguir e como o iPet pode fazer por ele o que ele não quer ou não sabe fazer.

---

## 1. O Problema Central

A maior dor não é a falta de informação — é a **desorientação na sequência**.

> "Primeiro compro a passagem ou primeiro faço os exames?"

A resposta certa — "depende do destino e do prazo" — exige conhecimento que o tutor não tem. O iPet existe para eliminar essa dúvida e guiar o usuário do ponto zero até o embarque com confiança.

**Referências de jornada guiada que resolvem isso:**

| App | Problema que resolve | Como guia |
|-----|---------------------|-----------|
| **Mercado Livre** | "Onde está meu pedido?" | Estágios visuais: Confirmado → Preparando → A caminho → Entregue |
| **iFood** | "Quando chega minha comida?" | Tracker em tempo real com etapas |
| **Duolingo** | "Como aprendo um idioma?" | Caminho visual com etapas desbloqueáveis e gamificação |
| **Nubank** | "Como está minha conta?" | Status em tempo real na home, sem precisar navegar |

**Para o iPet:** o usuário precisa de um tracker tipo Mercado Livre, mas para a jornada de compliance do pet.

---

## 2. A Jornada Completa — 7 Estágios

```mermaid
flowchart LR
  S1 [ 🐾 Estágio 1. Pet cadastrado (microchip + perfil) ]
  S2 [ 🗺️ Estágio 2. Destino e data definidos ]
  S3 [ 📋 Estágio 3. Documentação sanitária ]
  S4 [ ✈️ Estágio 4. Passagem comprada ]
  S5 [ 🏨 Estágio 5. Hospedagem confirmada ]
  S6 [ 📄 Estágio 6. CVI emitido (D-10 a D-2) ]
  S7 [ 🎉 Estágio 7. Pronto para embarcar! ]

  S1 --> S2 --> S3 --> S4 --> S5 --> S6 --> S7
```

### Detalhamento por estágio

| Estágio | Critério de conclusão | Alerta de bloqueio |
|---------|----------------------|-------------------|
| **1 — Pet cadastrado** | Perfil completo: espécie, raça, peso, microchip | "Seu pet não tem microchip — necessário para viajar internacionalmente" |
| **2 — Destino definido** | Plano de viagem criado com destino + data de embarque | "Japão/Austrália: comece agora — prazo mínimo 7–8 meses" |
| **3 — Documentação** | Roadmap 100% concluído (todas as tarefas CONCLUIDA) | Cada tarefa pendente com prazo e ação disponível |
| **4 — Passagem comprada** | Comprovante anexado ou voo vinculado | "Se mudar a CIA, as regras de peso/raça podem mudar" |
| **5 — Hospedagem** | Opcional — hotel pet-friendly confirmado | "X hotéis pet-friendly no seu destino" |
| **6 — CVI emitido** | Disponível apenas D-10 a D-2 do embarque | "Emita entre [data] e [data]" |
| **7 — Pronto!** | Todos os anteriores + checklist de embarque completo | — |

---

## 3. Produtos iPet em Cada Estágio

O iPet não é apenas informação — é também **execução**. Em cada etapa com atrito, oferecemos 3 níveis de ajuda:

```
📍 INDICAR → mostrar onde resolver (clínicas, parceiros)
📅 FACILITAR → agendar pelo app (comissão para iPet)  
🛒 EXECUTAR → iPet faz por você (serviço próprio ou parceiro)
```

### Mapa de produtos por estágio

| Estágio | Produto iPet | Modelo | Receita |
|---------|-------------|--------|---------|
| 1 — Microchip | Agendar implante em clínica parceira | Facilitar | 15% comissão |
| 1 — Microchip | Kit microchip (venda) | Executar | Margem direta |
| 3 — Vacina | Agendar vacinação | Facilitar | 15% comissão |
| 3 — Sorologia | Clínica credenciada MAPA próxima | Indicar/Facilitar | 15% comissão |
| 3 — CVI | Agendar com vet credenciado | Facilitar | 15% comissão |
| 4 — Passagem | Busca Skyscanner (só cias que aceitam o pet) | Indicar | CPA Skyscanner |
| 5 — Hotel | Hotéis pet-friendly no destino | Indicar | CPA Booking/parceiro |
| Qualquer | Seguro pet de viagem | Indicar | 15–20% CPA |
| Qualquer | Caixa de transporte IATA | Vender | Margem direta |

---

## 4. Arquitetura do Journey Hub (tela principal)

Quando há uma viagem ativa, a home do app se transforma no **Journey Hub**:

```
┌─────────────────────────────────────────────────────┐
│  🐾 Max  →  🇯🇵 Japão                               │
│  ✈️ Embarque em 127 dias — 12 de agosto de 2026     │
│                                                      │
│  ──── Progresso ──────────────────────── 42% ────  │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                                      │
│  ✅  Estágio 1 — Pet cadastrado                     │
│  ✅  Estágio 2 — Destino definido                   │
│  🔄  Estágio 3 — Documentação (3 / 7)    ← AQUI    │
│  ○   Estágio 4 — Passagem                           │
│  ○   Estágio 5 — Hospedagem                         │
│  🔒  Estágio 6 — CVI (disponível em 117 dias)      │
│  ○   Estágio 7 — Pronto para embarcar!              │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📌 Próxima ação                             │   │
│  │ Agendar sorologia — prazo: 20 mai           │   │
│  │ [Ver clínicas próximas]  [iPet agenda]      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Estados dos estágios

```
✅  Concluído       → verde, check
🔄  Em andamento   → azul, progresso X/Y
○   Não iniciado   → cinza, aguardando anterior
🔒  Bloqueado      → cadeado, motivo exibido
⚠️  Atenção        → amarelo, prazo curto
```

---

## 5. Estimativa de Custo — Transparência Total

Antes de iniciar a jornada, o usuário vê o custo total estimado:

```
💰 Estimativa para Max viajar ao Japão

Já pago
  ✅ Microchip                    R$ 120
  ✅ Vacina antirrábica           R$ 150

A pagar (obrigatório)
  ⏳ Sorologia FAVN               R$ 400–800
  ⏳ CVI (emissão)                R$ 200–400
  ⏳ Taxa embarque ANA/JAL        ¥ 20.000 (~R$ 700)

A pagar (recomendado)
  ○  Caixa de transporte IATA    R$ 200–500
  ○  Seguro pet de viagem        R$ 300–600

Total estimado: R$ 1.770 – R$ 3.270
```

---

## 6. Resposta para "Por onde começo?"

Fluxo do wizard de onboarding de viagem (máx. 3 perguntas):

```
Pergunta 1: Para onde você quer ir?
  → Resposta: Japão

Pergunta 2: Quando você quer viajar?
  → Resposta: Dezembro 2026

Pergunta 3: Seu pet já tem microchip e vacina antirrábica em dia?
  → Resposta: Só vacina, microchip não tem

RESULTADO:
"Para o Japão em dezembro, você tem 8 meses.
 Mas precisa do microchip ANTES de refazer a vacina.
 ⚠️ A sorologia tem 180 dias de carência — comece AGORA.
 
 Data mais cedo possível para embarcar: 15 de nov 2026 ✓
 
 [Montar meu roadmap completo]"
```

---

## 7. Modo Aeroporto — dia do embarque

Ativado automaticamente quando faltam < 24h para o voo:

```
🛫 MAX — LATAM 3088 → TÓQUIO
Embarque: hoje, 14h30 · Terminal 3 · Portão G22

DOCUMENTOS (apresentar nesta ordem):
[ ] 1. Passaporte digital do pet (QR Code) ← toque aqui
[ ] 2. Vacina antirrábica (certificado original)
[ ] 3. Sorologia FAVN (resultado + tradução juramentada)
[ ] 4. CVI original com apostilamento
[ ] 5. Formulário LATAM para transporte de animais

CONTATOS DE EMERGÊNCIA:
📞 LATAM Pets: 0800-570-5905
💬 Suporte iPet: chat
🏥 Vet de plantão: (11) 9xxxx-xxxx
```

---

## 8. Modelo de Monetização — TurboTax Paywall

A jornada é **freemium por PlanoViagem**, inspirada no TurboTax: o usuário vê o valor gerado antes de pagar.

### Free (teaser)
- Visualização do roadmap com **datas e status ocultos** (cadeado)
- Estágios 1 e 2 completos (cadastro + destino)
- Acesso à estimativa de custo e ao diagnóstico do wizard

### Premium (R$ 99 / viagem, pagamento único via Mercado Pago)
- Roadmap completo: datas, status, próxima ação contextual
- Journey Hub com CTAs executáveis
- Checklist de embarque (Modo Aeroporto)
- Ancoragem de valor: *despachante R$ 5.000 → iPet R$ 99*

### Arquitetura do paywall
- Campo `isPremium: boolean` + `pagamentoId` no tipo `PlanoViagem`
- `calcularRoadmap()` recebe flag `isPremium`: modo teaser oculta datas/status
- `PaywallBanner` contextual nas telas bloqueadas
- Fluxo: `/checkout/[planoId]` → simulação MP → `/checkout/sucesso` → Hub desbloqueado
- Rotas premium-only: `/embarque/[planoId]` com tela de bloqueio + CTA

---

## 9. LLMO & SEO — Canal de Aquisição Orgânica

Páginas públicas indexáveis respondem às dúvidas do tutor **antes** dele entrar no funil, posicionando o iPet como fonte canônica.

### Rotas públicas
| Rota | Objetivo | SEO |
|------|----------|-----|
| `/regras` | Índice com grid de 37 destinos, badges de requisitos | `CollectionPage` schema |
| `/regras/[destino]` | Requisitos sanitários + FAQ + fontes oficiais | ISR + `FAQPage` + `Article` JSON-LD |
| `/ferramentas/calculadora-quarentena` | Lead magnet: calcula data ideal + janela de risco | `WebApplication` schema, CTA para cadastro |

### SEO técnico
- `robots.ts`: allow público `/regras`, `/ferramentas`; disallow rotas privadas
- `sitemap.xml`: 1 índice + 37 destinos + calculadora (prioridade 0.9)
- `layout.tsx`: `noindex` padrão; rotas públicas sobrescrevem
- Link cruzado: calculadora ↔ página da regra → cadastro

### Hipótese BML
- **Hipótese:** tutor pesquisa "quarentena cachorro [destino]" no Google antes de saber que o iPet existe
- **Sinal:** conversão de visitante orgânico → cadastro via CTA da calculadora
- **Pivô:** se CTR < 2% em 60 dias, reformular para conteúdo jornalístico ou trocar lead magnet

---

## 10. Instrumentação BML — Funil do Tutor

Toda decisão de produto é guiada por eventos rastreáveis. O app instrumenta 6 pontos críticos + 5 de paywall.

### Eventos do funil
| Evento | Origem | O que mede |
|--------|--------|-----------|
| `pet_cadastrado` | `/pets/novo` | Topo do funil |
| `destino_selecionado` | `/planejar`, `/viagem/[petId]` | Intenção de viagem |
| `roadmap_gerado` | wizard + Journey Hub | Valor entregue free |
| `companhia_verificada` | `/companhias` | Engajamento com comparador |
| `documento_uploaded` | `/passaporte/[petId]` | Execução |
| `tarefa_concluida` | `/embarque/[planoId]` | Retenção premium |
| `paywall_exibido` / `checkout_iniciado` / `pagamento_confirmado` | fluxo premium | Conversão |
| `calculadora_usada` / `calculadora_cta_clicado` | rota pública | LLMO |

### Dashboard
- `/admin/metricas` — visualização do funil, rankings de destinos/cias, contagem de veredictos
- Atualização automática (5s), persistência em `localStorage` (cap 5000 eventos)
- Acesso via Configurações > Métricas BML

---

## 11. Status das Features de Journey por Release

| Feature | Status | Nota |
|---------|--------|------|
| Timeline visual do roadmap | ✅ Entregue | abr/2026 |
| Journey Hub — Central da Viagem | ✅ Entregue | 7 estágios, progresso ponderado, CTA contextual |
| Wizard "Por onde começo?" | ✅ Entregue | 3 passos, diagnóstico viável/inviável + data mínima |
| Estimativa de custo total | ✅ Entregue | KB curado por destino, já pago vs. pendente |
| Comparador de companhias aéreas | ✅ Entregue | 9 cias, veredicto por pet (peso/raça/braqui) |
| Paywall TurboTax | ✅ Entregue | isPremium por PlanoViagem, checkout simulado |
| Modo Aeroporto (checklist de embarque) | ✅ Entregue | `/embarque/[planoId]`, 5 categorias dinâmicas |
| QR Code do passaporte | ✅ Entregue | Verificação pública em `/verificar/[petId]` |
| Clínicas veterinárias MVP | ✅ Entregue | 11 clínicas curadas, geoloc, lead gen tracking |
| Páginas públicas `/regras` + calculadora | ✅ Entregue | LLMO, SEO técnico, JSON-LD |
| Funil BML instrumentado | ✅ Entregue | 6 eventos + dashboard `/admin/metricas` |
| Auth Supabase + LGPD | ✅ Entregue | OAuth Google/Apple, KYC, Art. 18 |
| Checkout Mercado Pago real | 📋 Backlog F1B | Hoje simulado — webhook + PIX/cartão |
| iPet Services — Marketplace | 📋 Backlog F1B | Agendar vacina/sorologia/CVI com parceiros |
| Passagem comprada (vincular voo) | 📋 Backlog F1B | Upload comprovante + ajuste de regras |
| Hotéis pet — reserva no app | 📋 Backlog F1B | Hoje: listagem; próximo: CPA Booking |
| Notificações FCM | 📋 Backlog F1B | Lembretes de prazo por push |
| Compliance de retorno | 📋 Backlog F1C | Regras de reentrada no Brasil |
| Pesquisa de passagens (Skyscanner) | 🔮 Futuro | CPA |

---

## 12. Princípio de Design

> **"O usuário nunca deve se perguntar 'o que faço agora?'"**

Cada tela do iPet deve sempre responder a pergunta implícita do usuário:
1. **Onde estou?** — estágio atual destacado
2. **O que está pendente?** — próxima ação sempre visível
3. **Como o iPet me ajuda?** — produto/serviço contextual disponível
4. **Quando preciso agir?** — prazo e urgência sempre claros

---

*Documento vivo — atualizar a cada nova feature ou decisão de produto.*
