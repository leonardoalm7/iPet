# iPet Pass — Contexto para Discussao de Modelo de Negocio

> **Arquivo temporario** — usar como contexto para sessao com LLM. Excluir depois.

---

## 1. O que e o iPet

**iPet** e um super app pet. O primeiro produto e o **iPet Pass** — uma plataforma de Compliance Sanitario as a Service (CSaaS) que guia tutores de pets pela jornada completa de viagem aerea internacional.

**Equipe fundadora:**
- Danielle Moreira (CEO)
- Victor Hugo Telles (CTO)
- Brunna Rosa (CPO)
- Leonardo Braga de Almeida (COO)

**Contexto academico:** o projeto nasceu como trabalho de MBA na FIAP e esta sendo desenvolvido para se tornar uma startup real.

---

## 2. Problema que resolvemos

O tutor que quer viajar de aviao com seu pet enfrenta:
- **Desorientacao na sequencia**: "Primeiro compro a passagem ou primeiro faco os exames?"
- **Regras fragmentadas**: cada pais tem requisitos diferentes (vacinas, sorologia, prazos, quarentena)
- **Regras por companhia aerea**: peso, tamanho, racas proibidas, braquicefalicos
- **Risco real**: ser barrado no aeroporto com o pet ja na caixa de transporte
- **Custo invisivel**: o tutor nao sabe quanto vai gastar no total

**Tamanho do mercado (Brasil):**
- 160 milhoes de pets (IBGE 2024)
- Mercado pet BR: R$ 67 bilhoes/ano (2024)
- Crescimento: ~14% ao ano
- Segmento de viagem pet: estimado em R$ 2-3 bilhoes/ano (clinicas, exames, taxas aereas, caixas, seguros)

---

## 3. O que ja construimos (status abril 2026)

### Prototipo funcional (Next.js + TypeScript)
- Cadastro de pet (especie, raca, peso, microchip, vacina, sorologia)
- Passaporte digital com upload de documentos e QR Code
- Motor de compliance: 32 destinos, 30+ companhias aereas
- Roadmap inteligente com prazos calculados retroativamente
- Verificador de companhias aereas (cabine vs. porao, racas, peso)
- Estimativa de custos por destino
- Checklist de embarque
- Seletor de clinicas credenciadas
- Dashboard de metricas Build-Measure-Learn
- Auth (Google, Apple, email) via Supabase
- LGPD compliance (consentimento, hash de CPF)
- 8 testes automatizados passando

### O que falta para go-live do MVP
- Persistencia em banco (Supabase PostgreSQL — hoje e localStorage)
- Deploy em producao (Vercel)
- Integracao auth real com Supabase
- Testes E2E
- **Estimativa: 3-4 semanas focadas**

---

## 4. Estrategia de Monetizacao — Tabela Atual

O iPet opera em 3 niveis de servico por estagio da jornada:

| Nivel | O que faz | Modelo |
|-------|-----------|--------|
| INDICAR | Mostra onde resolver (clinicas, parceiros) | Lead gen, CPA |
| FACILITAR | Agenda pelo app | Comissao 15% |
| EXECUTAR | iPet faz por voce | Margem direta |

### Mapa de receita por estagio da jornada

| Estagio | Produto/Servico | Modelo | Receita estimada |
|---------|-----------------|--------|------------------|
| 1 — Microchip | Agendar implante em clinica parceira | Facilitar | 15% comissao (~R$ 20-40) |
| 1 — Microchip | Kit microchip (venda direta) | Executar | Margem direta |
| 3 — Vacina | Agendar vacinacao | Facilitar | 15% comissao (~R$ 15-30) |
| 3 — Sorologia | Clinica credenciada MAPA proxima | Indicar/Facilitar | 15% comissao (~R$ 60-120) |
| 3 — CVI | Agendar com vet credenciado | Facilitar | 15% comissao (~R$ 30-60) |
| 4 — Passagem | Busca Skyscanner (cias que aceitam o pet) | Indicar | CPA Skyscanner |
| 5 — Hotel | Hoteis pet-friendly no destino | Indicar | CPA Booking/parceiro |
| Qualquer | Seguro pet de viagem | Indicar | 15-20% CPA |
| Qualquer | Caixa de transporte IATA | Vender | Margem direta |

---

## 5. Estimativa de Custo Operacional Mensal

### Fase 0-1000 usuarios (custo quase zero)

| Servico | Tier | Custo mensal |
|---------|------|-------------|
| Vercel (hosting + CDN) | Hobby (free) → Pro | R$ 0 → R$ 100/mes |
| Supabase (auth + DB) | Free tier (500MB, 50k auth) | R$ 0 |
| Firebase FCM (push) | Free (ate 10k/dia) | R$ 0 |
| Google Maps API | $200/mes credit gratis | R$ 0 |
| Dominio (.com.br) | Registro.br | R$ 40/ano |
| **Total 0-100 usuarios** | | **~R$ 5/mes** |
| **Total 100-1000 usuarios** | Vercel Pro + Supabase Pro | **~R$ 200-400/mes** |

### Fase 1000-10.000 usuarios

| Servico | Tier | Custo mensal |
|---------|------|-------------|
| Vercel Pro | Bandwidth + Functions | R$ 100-500 |
| Supabase Pro | 8GB DB + 100k auth | R$ 130 |
| Firebase | Blaze (pay as you go) | R$ 50-200 |
| Google Maps | Excedente do credit | R$ 0-300 |
| Monitoring (Sentry) | Free → Developer | R$ 0-150 |
| **Total** | | **R$ 400-1.300/mes** |

---

## 6. Publico-alvo da Fase 1

**Persona primaria:** Tutor de pet (cao ou gato) que vai viajar de aviao pela primeira vez com o animal.

**Perfil:**
- Classe B/C, 25-45 anos
- Ja viajou de aviao (sem pet)
- Disposto a gastar R$ 1.500-5.000 no processo total
- Dor principal: "nao sei por onde comecar"
- Canal de aquisicao: Google ("como viajar com cachorro de aviao"), Instagram, TikTok, grupos de Facebook

**Persona secundaria:** Tutor frequente (ja viajou com pet, quer otimizar o processo).

---

## 7. Perguntas em aberto para o modelo de negocio

1. O app deve ser 100% gratuito no inicio (growth) ou ja cobrar algo?
2. Se freemium, o que fica free e o que fica premium?
3. Faz sentido assinatura mensal para um uso que pode ser esporadico (1-2 viagens/ano)?
4. Marketplace de clinicas com comissao e suficiente como modelo principal?
5. Como monetizar entre viagens (o tutor so volta quando planeja a proxima)?
6. Ads contextuais (hoteis, seguros, caixas IATA) sao uma boa fonte ou poluem o UX?
7. Whitelabel para clinicas/pet shops e uma oportunidade real?
8. API-as-a-Service (compliance engine) para outros apps pet e viavel?
9. Qual o pricing ideal considerando que o tutor ja vai gastar R$ 1.500-5.000 no processo?
10. Como evitar churn depois que o tutor completa a viagem?

---

## 8. Fases do Super App

| Fase | Publico | Produto | Modelo de receita potencial |
|------|---------|---------|----------------------------|
| 1 | Tutor do pet | iPet Pass (jornada pre-embarque) | Freemium? Comissao? Assinatura? |
| 2 | Clinicas veterinarias | iPet Vet (ERP + parceria) | SaaS B2B (assinatura mensal) |
| 3 | Companhias aereas | iPet Gate (RFID + compliance) | Licenciamento B2B |

---

*Gerado em 2026-04-24. Usar como contexto descartavel para sessao de business modeling.*
