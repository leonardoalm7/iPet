# CLAUDE.md — Guia de Desenvolvimento iPet

Leia este arquivo no início de cada sessão para manter consistência entre terminais.

## Regra Inviolável de Branching

**A branch `main` nunca deve ser tocada diretamente.**

Todo desenvolvimento deve ocorrer em branches dedicadas, criadas a partir de `main`, para revisão dos sócios antes do merge. Formato sugerido:

```
feat/<escopo>-<descricao-curta>
fix/<escopo>-<descricao-curta>
docs/<escopo>-<descricao-curta>
```

Exemplos:
- `feat/tutor-app-pre-travel-journey`
- `feat/compliance-engine-new-destinations`
- `fix/agente-aeroporto-image-fallback`

## Sobre o Projeto

**iPet** é um super app Pet com o **Pet Pass** como produto principal.

- **Modelo de negócio:** CSaaS (Compliance Sanitário as a Service)
- **CEO:** Danielle Moreira
- **CTO:** Victor Hugo Telles
- **CPO:** Brunna Rosa
- **COO:** Leonardo Braga de Almeida

### 3 Fases de Release / Públicos-alvo

| Fase | Público | Produto | Status |
|------|---------|---------|--------|
| 1 | Tutor do pet | Jornada pré-embarque: orientação de documentos, exames e prazos por destino | **FOCO ATUAL** |
| 2 | Clínicas veterinárias | ERP Vet + habilitação como parceira de negócio | Planejado |
| 3 | Companhias aéreas | Leitor RFID Bluetooth + motor de compliance no aeroporto | Futuro (hardware) |

### Fase 1 — Jornada do Tutor (prioridade máxima)

O fluxo começa no **cadastro do usuário e do pet** e vai até a **escolha do destino e sugestões de companhias aéreas**, incluindo:

1. Cadastro do responsável e do pet (microchip, espécie, raça, peso, tamanho)
2. Seleção de destino
3. Motor de compliance: regras por país de destino (vacinas, sorologia, prazos, quarentena)
4. Roadmap de exames com prazos e datas-chave
5. Sugestão de clínicas veterinárias parceiras (Google Maps API)
6. Regras por companhia aérea (peso, tamanho do pet, cabine vs. porão)
7. Alertas e notificações (Firebase Cloud Messaging)

### Domínios DDD Mapeados

- **Core:** PET Pass, Gestão de Saúde
- **Supporting:** Cadastro de Pets, Veterinários, Cias. Aéreas
- **Generic:** Pagamentos (Mercado Pago)
- **Externos (ACL):** Google Maps, Firebase FCM, VIGIAGRO

### Regras de Compliance Já Implementadas

| Destino | Vacina Antirrábica | Sorologia | Carência Sorologia |
|---------|-------------------|-----------|-------------------|
| Brasil | Obrigatória (≥21 dias) | Não obrigatória | — |
| União Europeia | Obrigatória (≥21 dias) | Obrigatória (status OK) | ≥90 dias da coleta |
| Japão | Obrigatória (≥21 dias) | Obrigatória (status OK) | ≥180 dias da coleta |

### Protótipos Existentes

- `prototipos/agente-aeroporto/` — Next.js (TypeScript + Tailwind). Simula o painel do agente de aeroporto com leitura de microchip Bluetooth e validação binária Apto/Inapto.

### Stack Estratégica

- **Frontend protótipos:** Next.js + TypeScript + Tailwind CSS
- **Mapas/Geo:** Google Maps API
- **Notificações:** Firebase Cloud Messaging
- **Banco de dados:** PostgreSQL (com cache/read replicas)
- **Pagamentos:** Mercado Pago
- **Blockchain (futuro):** Polygon (prova de autenticidade de documentos)

## Backlog do Produto (Trello — jan/fev 2026)

Itens identificados no backlog:
- API Sistema único da ANAC
- ERP Vet
- Quais pets podem embarcar?
- Quando eles podem ir na cabine?
- Reputação da companhia aérea com relação a Pets
- PostgreSQL com cache (read replicas quando tutor visualiza dados)
- Pesquisa de passagens — acordos com Skyscanner (anúncios patrocinados)
- Hotel pet

## Convenções de Desenvolvimento

- Todo novo protótipo vai em `prototipos/<nome-do-prototipo>/`
- Documentação técnica vai em `docs/architecture/`
- User stories vão em `docs/requirements/`
- Apresentações/pitch em `docs/presentations/`
- Planos de negócio em `docs/business/`

## Workflow por Sessão

1. Verificar branch atual (`git branch`)
2. Criar branch dedicada a partir de `main` antes de qualquer código
3. Desenvolver e commitar na branch
4. Nunca fazer push direto para `main`
5. Abrir PR para revisão dos sócios
