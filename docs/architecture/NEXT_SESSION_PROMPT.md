# Prompt — Próxima Sessão iPet

> Retomar daqui quando os tokens renovarem.

---

## 1. Correção de nomenclatura

Renomear **"Pet Pass"** para **"Pet Pass"** em todo o codebase, UI e documentação.

O **Pet Pass** é a principal BU dentro do ecossistema **iPet** — não é o produto, é uma das unidades de negócio.

---

## 2. Nova BU: Pet Health

### Visão
> "Suba a carteira de vacinação. Deixa o restante com a gente."

O Pet Health é um organizador inteligente de saúde do pet — **não é convênio**, é um assistente de gestão de saúde. A analogia de produto é o Journey Hub do Pet Pass, mas para a saúde cotidiana.

### Features principais

#### Agenda de Vacinação
- Upload da carteira de vacinação (foto/PDF)
- Vacinas já aplicadas (histórico)
- Próximas vacinas marcadas (agenda)
- Próximas vacinas NÃO marcadas (gaps — o que está em atraso ou pendente)
- Alertas de gaps: "Seu pet está com a vacina X em atraso há Y dias"

#### Notificações Push (Firebase FCM)
- Lembrete para vacinas marcadas (D-7, D-1, dia)
- Alertas para vacinas próximas sem agendamento ("Está na hora de agendar a antirrábica")
- Integração com calendário Google ou Apple

#### Cronograma de Antiparasitas e Vermífugos
Agenda inteligente baseada no produto em uso:

| Medicamento | O que combate | Frequência |
|---|---|---|
| Simparic / NexGard | Pulgas e Carrapatos | Mensal |
| Bravecto | Pulgas e Carrapatos | Trimestral |
| Vermífugo Comum | Vermes intestinais | A cada 3–4 meses |
| Combo (ex: Spectra) | Pulgas + Carrapatos + Vermes | Mensal |

- Dose calculada por peso (campo já existente no perfil do pet)
- Lembrete de reforço (ex: "Bravecto vence em 15 dias")
- Sugestão de combo baseada no perfil (raça, peso, estilo de vida)

#### Dicas Contextuais (proativas)
Exemplos:
- **Vai à praia?** "Se for ao litoral, cheque a proteção contra Dirofilariose. Seu pet toma Simparic — complementar com Milbemax antes de viajar."
- **Leishmaniose:** "Regiões de mata próximas à praia: coleira repelente (Seresto ou Scalibor) é recomendada."
- Gatilho: dica aparece quando o usuário tem viagem ativa no Pet Pass para destino de praia/litoral/região endêmica.

#### Integração com Clínicas Veterinárias (personalidade)
O segredo é **pessoalidade** — o app lembra de quem cuida do pet:
- Vincular consultas a uma clínica específica (ex: Dr. Wilson — PetVet)
- Lembrete de consulta marcada
- Sugestão de contato se não há consulta marcada há X meses
- Histórico de consultas por clínica/veterinário

#### Integração com Convênios (ex: PetLove Saúde)
- **Não competir** — complementar
- Se o responsável tem convênio PetLove, buscar API/parceria para integrar
- Convênios não são o nicho; o iPet organiza e lembra, o convênio paga

---

## 3. Tarefa: Gerar cards no Trello para Pet Health

Identificar os cards com prefixo `[PH]` (Pet Health).
Usar a estrutura de listas já existente no board Kanban.
Labels: Vertical Produto + Fase 1A ou 1B conforme prioridade.

---

## 4. Nova BU: Marketplace Pet (após Pet Health)

### Visão
> iFood + Mercado Livre, mas só para pets. Conecta o pet shop local ao responsável.

**Missão:** desmonopolizar Petz e Cobasi, favorecendo pequenos negócios locais.

### Modelo
- Pet shop sobe catálogo no app
- Recebe pedidos pelo app
- Solicita motoboy (integração Loggi/iFood For Business ou similar)
- Entrega ao responsável
- Toda a relação construída dentro do iPet

### Fase 1 (MVP de mapeamento)
- Mapa de pet shops locais no app (Google Maps API — já planejado)
- Avaliação e preços visíveis
- Sem transação ainda — só descoberta e contato

### Fase 2
- Catálogo digital do pet shop
- Pedido pelo app
- Pagamento (Mercado Pago — já na stack)
- Logística last-mile

### Tarefa: Gerar cards no Trello para Marketplace Pet
Prefixo: `[MP]` (Marketplace Pet)

---

## Contexto técnico

- Branch ativa: `feat/responsavel-pre-travel-journey`
- Build: limpo, zero erros TypeScript
- Supabase: bypass ativo — roda sem .env.local
- Último commit: `30470de` — fix Supabase bypass
- Stack: Next.js 16 + TypeScript + Tailwind + Zustand + framer-motion + date-fns
- Trello board: `qI30aqNf` — credenciais na memória `reference_trello.md`
