# iPet — Pet Market BU
**Versão:** 1.0 | **Data:** 2026-04-18 | **Status:** Concepção

---

## Visão

> **iFood + Mercado Livre, mas só para pets.**  
> Conecta o pet shop local ao responsável. Democratiza e horizontaliza o varejo pet.

**Missão:** desmonopolizar Petz e Cobasi, favorecendo os pequenos negócios do ecossistema pet local.

---

## Posicionamento no Ecossistema iPet

```
iPet (Super App)
├── Pet Pass    — compliance de viagem (BU principal)
├── Pet Health  — gestão de saúde cotidiana
└── Pet Market  — marketplace local (esta BU)
```

---

## O Problema

**Petz e Cobasi** dominam o mercado pet brasileiro com:
- Poder de compra de grandes volumes (preço mais baixo)
- Logística própria
- Apps polidos e programas de fidelidade

**O pet shop local** tem:
- Atendimento personalizado e de confiança
- Proximidade com o cliente
- Conhecimento do pet pelo nome
- Mas **sem canal digital** — perde para os grandes por falta de tecnologia

**O iPet resolve isso** ao dar ao pet shop local o mesmo canal digital que os grandes têm — sem custo de desenvolvimento, dentro de um ecossistema já em uso pelo responsável.

---

## Modelo de Negócio

| Agente | O que faz | Como ganha |
|--------|-----------|-----------|
| Pet shop local | Sobe catálogo, recebe pedidos, solicita entrega | Mais vendas, sem custo de app |
| Responsável | Descobre, compra, recebe em casa | Conveniência + apoio ao local |
| iPet | Conecta os dois | Taxa de serviço por pedido (% GMV) |

### Comparativo

| Atributo | Petz/Cobasi | Pet Market iPet |
|----------|------------|-----------------|
| Vendedor | Grande rede | Pet shop local do bairro |
| Preço | Agressivo por volume | Competitivo + conveniência |
| Confiança | Marca | Relacionamento já existente |
| Entrega | Centro de distribuição | Motoboy local (< 30 min) |
| Monetização iPet | N/A | % por pedido + destaque pago |

---

## Fase 1 — MVP de Descoberta (mapeamento)

**Objetivo:** mostrar que a demanda existe. Sem transação, sem catálogo.

### Features
- Mapa de pet shops locais (Google Maps API — já planejado na stack)
- Listagem por distância / avaliação / categoria
- Avaliação do pet shop (estrelas + comentários)
- Horário de funcionamento e contato (WhatsApp / telefone)
- Badge "Parceiro iPet" para pet shops cadastrados

### Critério de sucesso
- Responsável acessa o mapa e encontra um pet shop próximo
- Pet shop consegue ser encontrado por clientes sem ter app próprio

---

## Fase 2 — Catálogo e Pedido

### Features
- Pet shop sobe catálogo (produtos + preços + fotos)
- Responsável adiciona ao carrinho e faz pedido pelo app
- Pagamento via Mercado Pago (já na stack)
- Notificação de confirmação, preparo e saída para entrega

### Logística
- Integração com Loggi / iFood for Business / motoboy autônomo cadastrado
- Pet shop pode ter motoboy próprio (entrega direta)
- Rastreio em tempo real (mapa de entrega)

---

## Fase 3 — Ecossistema Completo

- **Assinatura de produtos** (ração recorrente)
- **Programa de fidelidade** integrado ao iPet Pass
- **Pet shop cadastra serviços**: banho, tosa, consulta, creche
- **Agenda de serviços** integrada ao Pet Health (consulta agendada aparece no calendário)
- **Avaliação pós-compra** com histórico por pet shop

---

## 8. Roadmap de Features por Fase

| Feature | Fase | Prioridade |
|---------|------|-----------|
| Mapa de pet shops locais | F1A | Alta |
| Perfil do pet shop (horário, contato, avaliação) | F1A | Alta |
| Badge "Parceiro iPet" | F1A | Média |
| Catálogo digital do pet shop | F1B | Alta |
| Pedido e pagamento (Mercado Pago) | F1B | Alta |
| Logística last-mile (Loggi/motoboy) | F1B | Alta |
| Rastreio em tempo real | F1B | Média |
| Assinatura de produtos recorrentes | F1C | Média |
| Serviços agendáveis (banho/tosa) integrado Pet Health | F1C | Média |
| Programa de fidelidade | F1C | Baixa |

---

*Documento vivo — atualizar a cada nova feature ou decisão de produto.*
