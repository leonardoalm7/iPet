# User Story: Gestão Inteligente de Cronograma de Saúde 🩺

**Prioridade:** Alta  
**Estimativa:** 5 Pontos de História

## 1. Descrição

Como um responsável de animais que gerencia pets com cronogramas distintos, eu quero um recurso na plataforma **iPet Pass** que monitore e gerencie automaticamente os cronogramas de vacinas, vermífugos e antipulgas. O objetivo é garantir o bem-estar dos filhotes de forma estruturada, com sincronização em calendários externos e alertas proativos.

## 2. Critérios de Aceitação

Para que esta funcionalidade seja considerada concluída, deve atender aos seguintes requisitos:

- **Integração com Calendários Externos**: O usuário deve ser capaz de sincronizar automaticamente os eventos de saúde (próximas doses e vacinas) para seu calendário pessoal (Google Calendar, Outlook ou iCalendar) em tempo real.
- **Notificações Push Configuráveis**: O sistema deve enviar alertas 7 dias, 3 dias e 1 dia antes da data programada para a próxima dose de antipulgas ou vermífugo.
- **Gestão de Status**: O usuário deve conseguir marcar uma dose como "Aplicada" diretamente pela notificação ou pela interface do aplicativo.
- **Cálculo Automático**: Alertas de vacinas baseados na data de nascimento do pet (especialmente críticos nos primeiros meses).

## 3. Protótipo de Dados (Backend)

Campos necessários para a modelagem inicial pelo CTO:

### Entidade: Pet

| Campo             | Tipo      | Descrição                                             |
| :---------------- | :-------- | :---------------------------------------------------- |
| `pet_id`          | UUID      | Identificador único do pet.                           |
| `data_nascimento` | DATE      | Essencial para o cálculo do cronograma automático.    |
| `tipo_especie`    | ENUM      | Cão ou Gato (define regras específicas de vacinação). |
| `data_registro`   | TIMESTAMP | Data de criação do registro no ecossistema.           |

### Entidade: Registro de Saúde (Health Record)

| Campo                | Tipo    | Descrição                                               |
| :------------------- | :------ | :------------------------------------------------------ |
| `registro_id`        | UUID    | Identificador único do registro de dose/vacina.         |
| `pet_id`             | UUID    | Chave estrangeira vinculada à entidade Pet.             |
| `tipo_medicamento`   | ENUM    | VACINA, ANTIPULGAS ou VERMÍFUGO.                        |
| `nome_comercial`     | VARCHAR | Nome específico do produto (ex: Simparic, Vanguard).    |
| `data_ultima_dose`   | DATE    | Data da última aplicação efetiva.                       |
| `periodicidade_dias` | INTEGER | Intervalo padrão (ex: 30, 90, 365 dias).                |
| `data_proxima_dose`  | DATE    | Calculada: `data_ultima_dose` + `periodicidade_dias`.   |
| `lote_medicamento`   | VARCHAR | Informação para rastreabilidade e compliance sanitário. |

---

**Documentação Técnica iPet** | MBA Software Engineering - FIAP
_Responsável pela Operação: Leonardo Braga de Almeida (COO)_
