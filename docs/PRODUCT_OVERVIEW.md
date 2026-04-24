# iPet Pass — Visao Completa do Produto

**Versao:** 1.0 | **Data:** 2026-04-23 | **Autor:** Leonardo Braga de Almeida (COO)
**Branch de referencia:** `feat/analytics-service` (baseada em `feat/pet-pass`)

---

## Indice

1. [O que e o iPet Pass](#1-o-que-e-o-ipet-pet-pass)
2. [Features e Funcionalidades Existentes](#2-features-e-funcionalidades-existentes)
3. [Jornada do Usuario — Fluxo a Fluxo](#3-jornada-do-usuario--fluxo-a-fluxo)
4. [Metricas e Instrumentacao (BML)](#4-metricas-e-instrumentacao-bml)
5. [Base de Compliance (Knowledge Base)](#5-base-de-compliance-knowledge-base)
6. [Stack Tecnica](#6-stack-tecnica)
7. [Roadmap — Prioridades de Entrega](#7-roadmap--prioridades-de-entrega)

---

## 1. O que e o iPet Pass

O iPet Pass e um produto de **Compliance Sanitario as a Service (CSaaS)** que guia tutores de pets pela jornada completa de viagem internacional — do cadastro do animal ate o embarque.

**Problema que resolve:** o tutor nao sabe por onde comecar. Vacinas, sorologia, prazos por pais, regras por companhia aerea, CVI — tudo e fragmentado, confuso e com risco real de ser barrado no aeroporto.

**Proposta de valor:** um tracker tipo Mercado Livre, mas para compliance pet. O usuario ve onde esta, o que falta, quanto custa e quando precisa agir.

**Modelo de negocio:** comissoes de 15% sobre agendamentos em clinicas parceiras + CPA em passagens, hoteis e seguros.

---

## 2. Features e Funcionalidades Existentes

### 2.1 Cadastro de Pet (3 etapas)

**Rota:** `/pets/novo`

O formulario coleta tudo que o motor de compliance precisa para calcular regras:

| Etapa | Campos | Por que importa |
|-------|--------|-----------------|
| 1. Identificacao | Nome, especie (cao/gato), raca, data nascimento, peso, microchip | Peso define cabine vs. porao. Raca identifica braquicefalicos e perigosos. Microchip e obrigatorio para destinos internacionais |
| 2. Vacina antirrabica | Data, nome comercial, lote, veterinario | Carencia de 21 dias e regra global. Sem vacina valida, nenhum destino libera |
| 3. Sorologia | Data, valor (IU/mL), status, laboratorio | Obrigatoria para UE, Japao, Australia. Carencia de 90-180 dias |

**Validacoes:**
- Peso obrigatorio (usado no airline checker)
- Microchip ISO 11784/11785 (padrao internacional)
- Vacina com data retroativa permitida (importar historico)

---

### 2.2 Passaporte Digital

**Rota:** `/passaporte/[petId]`

Consolidacao visual de todos os dados e documentos do pet em formato de passaporte:

- **Perfil completo:** foto, nome, especie, raca, peso, microchip, idade calculada
- **Documentos sanitarios:** upload e listagem de vacinas, sorologia, CVI, registro de microchip, permissao de importacao
- **QR Code:** compartilhavel (futuro: verificacao via blockchain Polygon)
- **Status de compliance:** resumo por destino ja planejado

**Tipos de documento suportados:**
- `VACINA_ANTIRRABICA`
- `SOROLOGIA_ANTIRRABICA`
- `CVI` (Certificado Veterinario Internacional)
- `MICROCHIP_REGISTRO`
- `PERMISSAO_IMPORTACAO`

**Status de autenticacao:** PENDENTE → VERIFICADO → BLOCKCHAIN (futuro) | REJEITADO

---

### 2.3 Planejamento de Viagem

**Rotas:** `/planejar` (wizard) e `/viagem/[petId]` (direto)

Dois caminhos para o mesmo resultado — um roadmap personalizado de compliance:

**Wizard (`/planejar`):**
1. Seleciona o pet
2. Escolhe destino (grid agrupado por regiao com busca)
3. Define data de embarque
4. Recebe diagnostico + roadmap

**Direto (`/viagem/[petId]`):**
1. Ja sabe qual pet — vai direto para destino + data
2. Gera roadmap em preview
3. Pode salvar como plano de viagem

**Seletor de destinos:**
- 32 destinos organizados em 8 regioes (America do Sul, Central, Norte, Europa, Oriente Medio, Asia, Oceania, Africa)
- Busca por texto com filtro em tempo real
- Badges visuais indicando sorologia obrigatoria e permissao de importacao
- Grid 3 colunas com bandeira + nome

**Companhia aerea (opcional):**
- Dropdown com todas as cias cadastradas
- Ao selecionar, exibe resumo: peso cabine/porao, dimensoes caixa, braquicefalico aceito?

---

### 2.4 Roadmap de Compliance (Motor Central)

**Servico:** `travel-roadmap.ts` → `calcularRoadmap()`

O coracao do produto. Recebe pet + destino + data de embarque e gera uma lista sequencial de tarefas com prazos calculados retroativamente a partir da data de embarque.

**Tarefas geradas (5-10 por destino):**

| Tarefa | Quando | Condicao |
|--------|--------|----------|
| Implantar microchip | Primeira coisa | Se destino exige e pet nao tem |
| Vacina antirrabica | ≥21 dias antes do embarque | Sempre obrigatoria (exceto viagem domestica) |
| Sorologia FAVN | ≥90-180 dias antes do embarque | UE, Japao, Australia, Coreia do Sul etc. |
| Permissao de importacao | Variavel por pais | Japao, Australia, Nova Zelandia, Singapura etc. |
| CVI | D-10 a D-2 do embarque | Sempre — emitido por vet habilitado VIGIAGRO |

**Status inteligente por tarefa:**
- `CONCLUIDA` — pet ja tem o requisito cumprido
- `PENDENTE` — precisa fazer, prazo confortavel
- `URGENTE` — ≤7 dias para o prazo
- `CRITICO` — ≤2 dias para o prazo
- `VENCIDA` — prazo ja passou
- `BLOQUEADA` — depende de outra tarefa (ex: sorologia bloqueada ate vacina feita)
- `NAO_APLICAVEL` — destino nao exige

**Visualizacoes:**
- **Lista** (`RoadmapView`): cards sequenciais com status, prazo, dias restantes
- **Timeline** (`RoadmapTimeline`): linha do tempo visual com marcos

**Status geral do roadmap:** APTO | PENDENTE | URGENTE | CRITICO | INAPTO
**Data de liberacao:** calculada automaticamente (quando todas as carencias vencem)

---

### 2.5 Verificador de Companhias Aereas

**Rota:** `/companhias`

Verifica compatibilidade do pet com cada companhia aerea cadastrada.

**Servico:** `airline-checker.ts` → `verificarCompanhia(pet, cia)`

**Verificacoes por companhia:**
- Peso do pet vs. limite de cabine e porao
- Raca braquicefalica (Bulldog, Pug, Shih Tzu etc.) — ban total de porao em GOL, LATAM, VOEPASS
- Racas perigosas (Pit Bull, Rottweiler etc.) — ban total
- Idade minima do animal
- Cao-guia (Lei 11.126/2005) — regras especiais

**Veredictos:**
- `PODE_CABINE` — aceito em cabine
- `PODE_PORAO` — aceito apenas no porao
- `RESTRICAO` — aceito com ressalvas
- `NAO_ACEITO` — recusado pela companhia

**Modos de visualizacao:**
- **Lista:** cards individuais com detalhes expandiveis
- **Comparar:** seleciona ate 4 cias e ve tabela lado a lado (peso, dimensoes, braquicefalico, racas perigosas, idade minima, veredicto)

**Filtros:** Todas | Cabine | Porao | Recusadas

---

### 2.6 Estimativa de Custos

**Servico:** `cost-estimator.ts` + `cost-estimates.ts`

Calcula faixa de custo (min-max em BRL) para cada item da jornada:

| Item | Faixa (BRL) | Obrigatorio? |
|------|-------------|--------------|
| Microchip | 80–250 | Se exigido |
| Vacina antirrabica | 70–200 | Sim |
| Sorologia FAVN | 400–1.200 | Se destino exige |
| CVI | 180–500 | Sim |
| Caixa IATA | 150–800 | Sim |
| Taxa aerea | 200–1.400 | Sim (varia por distancia) |
| Seguro viagem pet | 280–750 | Recomendado |
| Hospedagem pet-friendly (7 noites) | 700–3.000 | Opcional |
| Permissao de importacao | 300–800 | Se destino exige |
| Traducao juramentada | 200–600 | Se destino exige |

**Inteligencia:** cruza com dados do pet para marcar itens ja pagos/concluidos vs. pendentes.

---

### 2.7 Clinicas Credenciadas

**Rota:** `/clinicas`

Diretorio de clinicas veterinarias com geolocalizacao:

- **Tipos:** Habilitado VIGIAGRO (pode emitir CVI), Laboratorio de Sorologia, Clinica Geral
- **Dados:** endereco, telefone, site, servicos, especies atendidas, peso maximo
- **Filtros:** por tipo de servico (CVI, sorologia, geral)
- **Ordenacao:** por distancia (geolocalizacao do usuario)
- **Engajamento rastreado:** buscas, cliques, ligacoes, navegacoes (metricas de lead gen)

---

### 2.8 Checklist de Embarque

**Rota:** `/embarque/[planoId]`

Lista de verificacao pre-voo organizada por categoria:

- **Documentacao:** carteira de vacinacao, certificado microchip, CVI, sorologia, passaporte do tutor
- **Preparacao do pet:** banho, unhas cortadas, identificacao na caixa
- **Viagem:** caixa em boas condicoes, agua, comida, medicamentos, itens de conforto
- **Chegada:** requisitos de quarentena (se aplicavel), contato vet no destino

Cada item tem flag `obrigatorio` e `dica` textual.

---

### 2.9 Journey Hub (Centro de Viagem)

**Rota:** `/viagens/[planoId]`

Tracker visual da jornada completa em 7 estagios (inspirado no Mercado Livre):

```
1. Pet cadastrado → 2. Destino definido → 3. Documentacao →
4. Passagem → 5. Hospedagem → 6. CVI emitido → 7. Pronto!
```

Cada estagio mostra status (completo/em andamento/bloqueado) com CTAs contextuais.

---

### 2.10 Sugestoes de Destinos e Hoteis

**Home (`/`):**
- Carrossel de destinos sugeridos (30+ destinos domesticos curados com dicas, melhor epoca, tipos de viagem)
- Secao de hoteis pet-friendly com avaliacoes e precos

---

### 2.11 Autenticacao e LGPD

**Rotas:** `/auth/*` e `/lgpd/*`

- **Login:** Google, Apple, email/senha (Supabase Auth)
- **Cadastro:** com verificacao de email
- **Recuperacao de senha**
- **LGPD compliant:**
  - Consentimento imutavel com audit trail
  - Direitos Art. 18: exportacao, exclusao, retificacao, portabilidade, revogacao
  - CPF armazenado como hash SHA-256 (nunca plaintext)
  - Politica de privacidade e termos de uso dedicados

---

### 2.12 Dashboard de Metricas (BML)

**Rota:** `/admin/metricas`

Painel administrativo com metricas Build-Measure-Learn:

- **Cards resumo:** total de eventos, sessoes unicas, taxa de conversao
- **Funil:** pet_cadastrado → destino_selecionado → roadmap_gerado → tarefa_concluida → documento_uploaded (com % de drop-off entre etapas)
- **Rankings:** destinos mais selecionados, companhias mais verificadas
- **Contagem por evento:** tabela completa
- **Auto-refresh:** a cada 5 segundos
- **Limpar dados:** com confirmacao

---

## 3. Jornada do Usuario — Fluxo a Fluxo

### Fluxo 1: Primeiro Acesso

```
[Abrir app] → [Tela de login] → [Cadastro Google/Apple/Email]
    → [Onboarding: aceite de termos + LGPD]
    → [Home vazia: CTA "Cadastre seu primeiro pet"]
```

**O que o usuario ve:** tela limpa com um botao claro. Sem fricao.

---

### Fluxo 2: Cadastrar Pet

```
[Home] → [+ Novo Pet]
    → [Etapa 1: Nome, especie, raca, peso, microchip]
    → [Etapa 2: Vacina antirrabica (data, lote, vet)]
    → [Etapa 3: Sorologia (data, valor, lab)]
    → [Confirmar] → [Pet aparece na Home + Passaporte criado]
```

**Decisao de design:** 3 etapas curtas em vez de formulario longo. Etapas 2 e 3 sao opcionais (o usuario pode preencher depois).

---

### Fluxo 3: Planejar Viagem (Fluxo Principal)

```
[Home] → [Planejar Viagem] → [Selecionar pet]
    → [Escolher destino: grid com 32 paises agrupados por regiao]
    → [Definir data de embarque]
    → [Selecionar companhia aerea (opcional)]
    → ["Ver o que preciso fazer"]
    → [Roadmap gerado com tarefas, prazos e status]
    → [Alternar: Lista ↔ Timeline]
    → ["Salvar esta viagem"] → [Plano criado no Journey Hub]
```

**Momento "aha":** quando o roadmap aparece com prazos calculados retroativamente. O usuario entende exatamente o que fazer e quando.

---

### Fluxo 4: Executar Roadmap

```
[Journey Hub] → [Ver roadmap]
    → [Tarefa: "Implantar microchip" — PENDENTE, 45 dias]
    → [CTA: "Buscar clinica"] → [/clinicas filtrado por servico]
    → [Selecionar clinica → ligar/navegar]
    → [Voltar → marcar tarefa como concluida]
    → [Upload documento comprobatorio no Passaporte]
```

**Loop:** repete para cada tarefa ate roadmap 100%.

---

### Fluxo 5: Verificar Companhias Aereas

```
[Home ou Menu] → [Companhias Aereas]
    → [Seleciona pet] → [Lista de cias com veredictos]
    → [Expandir detalhes: peso, dimensoes, restricoes]
    → [Modo Comparar: seleciona 2-4 cias]
    → [Tabela comparativa lado a lado]
```

**Valor:** evita surpresas no aeroporto (braquicefalico barrado, peso acima do limite).

---

### Fluxo 6: Checklist de Embarque

```
[Journey Hub: Estagio 7 desbloqueado]
    → [Checklist pre-voo por categoria]
    → [Marcar itens conforme prepara]
    → [100% = Pronto para embarcar!]
```

---

### Fluxo 7: Monitorar Metricas (Admin)

```
[Configuracoes] → [Metricas BML]
    → [Ver funil de conversao]
    → [Analisar drop-off entre etapas]
    → [Decisao: pivotar ou perseverar]
```

---

## 4. Metricas e Instrumentacao (BML)

### Eventos Rastreados

| Evento | Onde dispara | Props |
|--------|-------------|-------|
| `pet_cadastrado` | Confirmar cadastro | especie, temMicrochip |
| `pet_editado` | Salvar edicao | campos alterados |
| `destino_selecionado` | Selecionar pais | destino |
| `roadmap_gerado` | Gerar roadmap | destino, qtdTarefas |
| `tarefa_concluida` | Marcar tarefa | tarefaId, destino |
| `companhia_verificada` | Expandir cia | companhiaId |
| `documento_uploaded` | Upload no passaporte | tipo |
| `abandono_etapa` | Sair sem concluir | etapa, tempoMs |
| `pagina_visitada` | Navegacao | rota |

### Funil Principal

```
pet_cadastrado (100%)
    ↓ __% drop
destino_selecionado
    ↓ __% drop
roadmap_gerado
    ↓ __% drop
tarefa_concluida
    ↓ __% drop
documento_uploaded
```

**Hipotese central:** se o usuario gera o roadmap, a probabilidade de concluir pelo menos 1 tarefa e alta. O maior drop esperado e entre cadastro e selecao de destino.

---

## 5. Base de Compliance (Knowledge Base)

### Estrutura

```
compliance-kb/
  destinations/          ← 12 JSONs auditados (32 destinos mapeados no app)
    brasil.json
    argentina.json
    japao.json
    ...
  airlines/              ← JSONs por companhia
    latam.json
    gol.json
    azul.json
    ...
  schema/                ← Validacao JSON Schema
  scripts/
    generate-app-data.ts ← Gera kb-generated.ts a partir dos JSONs
    check-stale.ts       ← Alerta se revisao esta vencida
  REVIEW_GUIDE.md        ← Protocolo de revisao trimestral
```

### Governanca

- **Revisao trimestral obrigatoria** por destino e companhia
- Cada JSON tem: `lastVerified`, `verifiedBy`, `nextReviewDate`, `confidence` (ALTA/MEDIA/BAIXA)
- Fontes rastreadas com URLs e data de ultimo acesso
- Changelog versionado por destino

### Destinos com JSONs auditados (12)

Brasil, Argentina, Chile, Uruguai, Mexico, EUA, Canada, Uniao Europeia, Portugal, Reino Unido, Japao, Australia

### Destinos mapeados no app mas sem JSON dedicado (20)

Colombia, Peru, Paraguai, Bolivia, Equador, Panama, Costa Rica, Alemanha, Franca, Espanha, Italia, Holanda, Suica, Noruega, Emirados Arabes, Israel, Coreia do Sul, Singapura, Nova Zelandia, Africa do Sul

> Esses 20 usam regras inferidas do grupo (ex: Alemanha usa regras da UE). JSONs dedicados estao no roadmap.

---

## 6. Stack Tecnica

| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Frontend | Next.js 15 (App Router) + TypeScript | Implementado |
| UI | Tailwind CSS + Framer Motion + Lucide Icons | Implementado |
| State | Zustand (persist middleware, localStorage) | Implementado |
| Auth | Supabase Auth (Google, Apple, Email) | Implementado |
| Banco | Supabase PostgreSQL | Configurado, nao integrado |
| Analytics | Custom localStorage (typed events) | Implementado |
| Compliance | JSON KB → generate script → app data | Implementado |
| Testes | Vitest (servicos) | Parcial |
| Mapas | Google Maps API | Planejado |
| Notificacoes | Firebase Cloud Messaging | Planejado |
| Pagamentos | Mercado Pago | Planejado |
| Blockchain | Polygon (autenticidade docs) | Futuro |

---

## 7. Roadmap — Prioridades de Entrega

### Essencial para Go-Live do MVP

Sem estes itens, o produto nao pode ir para a mao do usuario real.

| # | Item | Status | Por que e essencial |
|---|------|--------|---------------------|
| 1 | **Cadastro de pet funcional** | Pronto | Sem pet, nada funciona |
| 2 | **Motor de compliance (roadmap)** | Pronto | Core do produto — sem isso e um formulario bonito |
| 3 | **Seletor de destinos (top 12)** | Pronto | Cobre 90%+ dos casos reais de viagem |
| 4 | **Verificador de cias aereas** | Pronto | Evita o pior cenario: ser barrado no aeroporto |
| 5 | **Passaporte digital (upload docs)** | Pronto | Centraliza documentacao do pet |
| 6 | **Estimativa de custos** | Pronto | Usuario precisa saber quanto vai gastar |
| 7 | **Checklist de embarque** | Pronto | Ultimo passo antes de viajar |
| 8 | **Autenticacao (Supabase)** | UI pronta | Precisa integrar com backend real |
| 9 | **Persistencia em banco (Supabase)** | Pendente | Hoje tudo e localStorage — nao sobrevive troca de device |
| 10 | **Deploy em producao** | Pendente | Vercel + dominio + SSL |
| 11 | **Fluxo de onboarding completo** | Parcial | Primeira impressao do usuario |
| 12 | **LGPD: consentimento + termos** | UI pronta | Obrigatorio por lei |

**Estimativa para go-live:** 3-4 semanas focadas (auth real + Supabase + deploy + testes E2E).

---

### Bom Ter na V1 Oficial (pos-MVP)

Itens que melhoram retencao e monetizacao, mas nao bloqueiam o lancamento.

| # | Item | Status | Impacto |
|---|------|--------|---------|
| 1 | **Notificacoes push (FCM)** | Planejado | Alerta de prazos vencendo — retencao |
| 2 | **Google Maps API (clinicas)** | Planejado | Busca por proximidade real — lead gen |
| 3 | **Custos regionalizados com fontes reais** | Card criado | Estimativas mais precisas por destino |
| 4 | **JSONs dedicados para 20 novos destinos** | Mapeado | Compliance auditado individualmente |
| 5 | **PWA (installable)** | Nao iniciado | "Instalar" no celular sem app store |
| 6 | **Dashboard BML com export** | Parcial | Decisoes data-driven para os socios |
| 7 | **Compartilhar passaporte (QR)** | UI pronta | Vet escaneia e ve dados do pet |
| 8 | **Multi-pet na mesma viagem** | Nao iniciado | Famílias com 2+ pets |
| 9 | **Historico de viagens** | Parcial | Reuso de dados para proxima viagem |
| 10 | **Portaria ANAC 17.476/2025** | Mapeado | 3 categorias (estimacao, ESA, cao-guia) |

---

### Mapeado para Futuro (pode esperar)

Itens estrategicos que dependem de traction ou parcerias.

| # | Item | Fase | Dependencia |
|---|------|------|-------------|
| 1 | **Blockchain Polygon (autenticidade)** | 1+ | Escala + custo de gas |
| 2 | **ERP Vet (clinicas parceiras)** | 2 | Base de clinicas ativas |
| 3 | **Leitor RFID Bluetooth (aeroporto)** | 3 | Hardware + parceria cia aerea |
| 4 | **Pagamento in-app (Mercado Pago)** | 1+ | Volume de transacoes |
| 5 | **Pesquisa de passagens (Skyscanner)** | 1+ | Parceria comercial |
| 6 | **Reserva de hotel (Booking API)** | 1+ | Parceria comercial |
| 7 | **Seguro viagem pet (parceria)** | 1+ | Acordo com seguradora |
| 8 | **API VIGIAGRO (consulta status)** | 1+ | Acesso governamental |
| 9 | **Integracao ANAC (sistema unico)** | 2-3 | API publica da ANAC |
| 10 | **Gamificacao (badges de viagem)** | 1+ | Retencao comprovada |
| 11 | **Marketplace de produtos pet** | 2+ | Escala de usuarios |
| 12 | **Concierge IA (chat assistente)** | 1+ | LLM + base de conhecimento |

---

## Apendice A: Figma e Prints

> **Nota sobre Figma:** a API do Figma oferece um plano gratuito (Personal/Starter) com tokens de acesso pessoal para leitura de arquivos. Se o time tiver um projeto no Figma, podemos integrar exportacao automatica de frames como imagens PNG para este documento.
>
> **Para configurar:**
> 1. Gerar Personal Access Token em figma.com/developers
> 2. Compartilhar o File Key do projeto
> 3. Script automatiza export de frames nomeados como `screen-*`
>
> **Enquanto isso:** os fluxos acima descrevem a jornada em linguagem natural. Para prints reais do prototipo funcionando, rodar `npm run dev` em `prototipos/responsavel-app/` e navegar pelos fluxos.

---

## Apendice B: Como Rodar o Prototipo

```bash
cd prototipos/responsavel-app
npm install
npm run dev
# Abrir http://localhost:3000
```

**Rotas principais para testar:**
- `/` — Home
- `/pets/novo` — Cadastrar pet
- `/passaporte/[petId]` — Passaporte digital
- `/planejar` — Wizard de viagem
- `/viagem/[petId]` — Planejador direto
- `/companhias` — Verificador de cias aereas
- `/embarque/[planoId]` — Checklist pre-voo
- `/admin/metricas` — Dashboard BML
- `/configuracoes` — Configuracoes

---

*Documento gerado em 2026-04-23. Reflete o estado do codigo nas branches `feat/pet-pass` e `feat/analytics-service`.*
