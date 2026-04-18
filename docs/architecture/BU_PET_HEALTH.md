# iPet — Pet Health BU
**Versão:** 1.0 | **Data:** 2026-04-18 | **Status:** Planejamento

---

## Visão

> **"Suba a carteira de vacinação. Deixa o restante com a gente."**

Pet Health é o organizador inteligente de saúde do pet dentro do ecossistema iPet.  
**Não é convênio.** É um assistente pessoal de gestão de saúde — pró-ativo, contextual e com memória.

A analogia de produto é o **Journey Hub do Pet Pass**, mas para a saúde cotidiana:  
em vez de 7 estágios até o embarque, são etapas de vacinação, antiparasitas e consultas — com o mesmo nível de clareza e orientação.

---

## Posicionamento no Ecossistema iPet

```
iPet (Super App)
├── Pet Pass    — compliance de viagem (BU principal)
├── Pet Health  — gestão de saúde cotidiana (esta BU)
└── Pet Market  — marketplace local (BU futura)
```

---

## 1. Agenda de Vacinação

### Fonte de dados
- Upload da carteira de vacinação (foto/PDF) → OCR extrai dados (roadmap)
- Entrada manual pelo responsável (MVP)
- Futuramente: integração com ERP veterinário (BU Fase 2)

### Estados de cada vacina

| Estado | Descrição | Ação iPet |
|--------|-----------|-----------|
| ✅ Aplicada | Registro completo no histórico | Exibe data + próxima dose |
| 📅 Marcada | Agendamento registrado | Envia lembrete D-7, D-1, Dia |
| ⏰ Pendente | Data estimada sem agendamento | Alerta "Está na hora de agendar" |
| ⚠️ Em atraso | Passou da data sem registro | Badge vermelho + notificação urgente |
| 🔒 Gap | Vacina ausente no histórico | "Seu pet não tem registro de [vacina]" |

### Vacinas core do calendário (cão)

| Vacina | Frequência | Observação |
|--------|-----------|-----------|
| V8 / V10 (polivalente) | Reforço anual | Filhote: esquema inicial 45/60/90 dias |
| Antirrábica | Anual | Obrigatória para viagem |
| Giárdia | Anual (opcional) | Recomendada em pets que frequentam parques |
| Bordetella (tosse dos canis) | Semestral ou anual | Pets em contato com outros cães |
| Leishmaniose | Protocolo de 3 doses + anual | Regiões endêmicas |

---

## 2. Cronograma de Antiparasitas e Vermífugos

Agenda inteligente gerada automaticamente pelo produto em uso + peso do pet (já no perfil).

### Tabela de referência

| Medicamento | O que combate | Frequência |
|---|---|---|
| Simparic / NexGard | Pulgas e Carrapatos | Mensal (30 dias) |
| Bravecto | Pulgas e Carrapatos | Trimestral (12 semanas) |
| Vermífugo Comum | Vermes intestinais | A cada 3–4 meses |
| NexGard Spectra / Milbemax combo | Pulgas + Carrapatos + Vermes + Dirofilária | Mensal |
| ProHeart (injetável) | Dirofilária (verme do coração) | Anual |

### Lógica de dose por peso
Campo `peso` já existe no `Pet` entity. A dose é calculada por faixa de peso conforme bula.  
O pet profile já coleta isso — Pet Health herda sem novo campo.

### Alertas proativos
- "Bravecto do Totó vence em 15 dias — lembre de comprar"
- "Vermífugo: última dose há 4 meses. Recomendado aplicar até [data]"

---

## 3. Dicas Contextuais (proativas)

### Gatilho: viagem ativa no Pet Pass

| Destino | Dica |
|---------|------|
| Litoral / praia | Alerta Dirofilariose: "Se toma Simparic, complementar com Milbemax antes da viagem" |
| Litoral com mata | Leishmaniose: "Coleira repelente Seresto ou Scalibor recomendada" |
| Interior / campo | Carrapato Estrela: verificar cobertura do antipulgas atual |
| Internacional | Integração com Pet Pass: requirements de saúde por destino |

### Outras dicas sazonais
- Verão → risco de carrapatos aumenta → reforçar frequência
- Pets que frequentam parques → sugerir Giárdia e Bordetella
- Filhote → esquema vacinal inicial com alertas cadenciados

---

## 4. Clínicas Veterinárias — Pessoalidade

O segredo é lembrar de quem cuida do pet. O app cria um vínculo entre o responsável, o pet e o profissional.

### Modelo de dados

```
ConsultaVeterinaria {
  id, petId, clinicaNome, veterinarioNome,
  data, tipo (rotina | emergencia | retorno | exame),
  status (realizada | marcada | cancelada),
  observacoes, proximaConsultaRecomendada
}
```

### Funcionalidades
- **Vincular consulta** a uma clínica/veterinário específico
- **Histórico** de consultas por pet
- **Lembrete** quando consulta marcada se aproxima (D-7, D-1)
- **Sugestão de contato** se não há consulta marcada há X meses: "Faz 6 meses que o Totó não consulta com o Dr. Wilson — quer agendar?"
- **Personalidade**: saudação ao registrar consulta — "Boa escolha! O Dr. Wilson acompanha o Totó desde [data]"

---

## 5. Integração com Convênios (não competição)

**Posicionamento:** convênios pagam, iPet organiza e lembra.

| Convênio | Modelo de integração |
|----------|---------------------|
| PetLove Saúde | API (se disponível) ou link externo — exibir cobertura no app |
| Banfield | Deep link para agendamento na rede |
| Vet+Saúde | Parceria para exibir rede credenciada no mapa |

> O iPet **não substitui o convênio** — ele é o assistente que garante que o responsável não perde a cobertura, não perde datas e não esquece do que o convênio cobre.

---

## 6. Notificações Push (Firebase FCM)

| Trigger | Mensagem | Urgência |
|---------|----------|----------|
| D-7 vacina marcada | "Em 7 dias: vacina V10 do Totó na PetVet" | Normal |
| D-1 vacina marcada | "Amanhã: vacina do Totó. Endereço: [clínica]" | Alta |
| Dia da vacina | "Hoje é dia da vacina! 💉 Boa sorte, Totó" | Alta |
| Vacina pendente sem agendamento | "Antirrábica do Totó vence em 15 dias. Quer agendar?" | Média |
| Vacina em atraso | "A antirrábica do Totó está em atraso há 3 dias" | Urgente |
| Antiparasita vencendo | "Bravecto vence em 10 dias — lembre de comprar" | Normal |
| Consulta sem agendar (6 meses) | "Faz 6 meses sem consulta. Quer agendar com Dr. Wilson?" | Baixa |

### Integração com Calendário
- Exportar vacinas/consultas para Google Calendar ou Apple Calendar
- Deep link para adicionar ao calendário no momento do registro

---

## 7. Integração com Pet Pass

Quando Pet Pass detecta viagem ativa para destino de risco:
- Pet Health recebe contexto → gera dica proativa específica
- Antiparasita alinhado ao protocolo do destino aparece no health hub

---

## 8. Roadmap de Features por Fase

| Feature | Fase | Prioridade |
|---------|------|-----------|
| Calendário de vacinas (entrada manual) | F1A | Máxima |
| Estados visuais da agenda (Journey Hub de saúde) | F1A | Máxima |
| Cronograma antiparasitas + vermífugos | F1A | Alta |
| Notificações push (FCM) | F1A | Alta |
| Vincular consulta a clínica/veterinário | F1A | Alta |
| Histórico de consultas | F1A | Média |
| Dicas contextuais (gatilho viagem) | F1B | Alta |
| Integração calendário Google/Apple | F1B | Média |
| Upload carteira de vacinação (OCR) | F1B | Média |
| Integração convênios (API parceiros) | F1C | Baixa |

---

*Documento vivo — atualizar a cada nova feature ou decisão de produto.*
