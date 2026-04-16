# iPet — Arquitetura do Super App
**Versão:** 1.0 | **Autores:** Danielle Moreira (CEO), Victor Hugo Telles (CTO), Brunna Rosa (CPO), Leonardo Braga de Almeida (COO) | **Data:** 2026-04-16

> **Regra de ouro:** documentar é tão importante quanto desenvolver. Este arquivo é o mapa vivo da plataforma — atualizar a cada nova feature ou decisão arquitetural.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [MindMap — Tudo o que o iPet faz](#mindmap)
3. [Domain-Driven Design — Bounded Contexts](#ddd)
4. [Arquitetura de Microserviços](#microservicos)
5. [Fluxo de Dados — Jornada do Responsável](#fluxo)
6. [Mapa de Features — Status Atual](#mapa-features)
7. [Decisões Arquiteturais Registradas](#decisoes)
8. [Stack por Serviço](#stack)

---

## 1. Visão Geral {#visão-geral}

O **iPet** é um Super App Pet organizado em 3 fases de release:

| Fase | Público | Produto | Status |
|------|---------|---------|--------|
| **1** | Responsável pelo pet | Smart Pet Pass — jornada pré-embarque | **Em desenvolvimento** |
| **2** | Clínicas veterinárias | ERP Vet + habilitação como parceira de negócio | Planejado |
| **3** | Companhias aéreas | Smart Gate RFID + motor de compliance no aeroporto | Futuro (hardware) |

**Modelo de negócio:** CSaaS — Compliance Sanitário as a Service.  
O iPet cobra uma assinatura pelo acesso à plataforma (responsável, clínica, companhia) e gera receita adicional via publicidade contextual (parceiros pet-friendly, hotéis, seguros).

---

## 2. MindMap — Tudo o que o iPet faz {#mindmap}

```mermaid
mindmap
  root((iPet Super App))
    SmartPetPass
      CadastroPet
        Especie_Raca_Peso
        MicrochipISO
        Foto_perfil
      PassaporteDigital
        Documentos_Sanitarios
        Hash_SHA256
        Blockchain_Polygon_futuro
      HealthChecklist
        Status_por_item
        Badge_de_autenticacao
    ComplianceEngine
      KnowledgeBase
        12_destinos_internacionais
        9_companhias_aereas
        Revisao_trimestral
        check_stale_script
        generate_app_data_script
      MotorInverso
        Roadmap_de_documentos
        Prazos_e_carencias
        Status_CONCLUIDA_URGENTE_CRITICO
        Data_de_liberacao_calculada
      Alertas
        FCM_push_notifications
        Lembretes_de_prazo
        Email_SMS_futuro
    TravelPlanner
      SelecaoDestino
        Regras_por_pais
        Roadmap_automatico
      CompanhiasAereas
        Peso_dimensoes
        Racas_braquicefalicas
        Cabine_vs_porao
      SugestoesPetFriendly
        Destinos_nacionais
        Destinos_internacionais
        Conteudo_editorial
        Dicas_de_viagem
      HoteisPet
        PetHotel_na_origem
        Hotel_petfriendly_no_destino
        Busca_por_destino
        Parceiros_futuros
    ClinicasVeterinarias
      BuscaGeolocalizacao
        Google_Maps_API
        Filtro_credenciadas_MAPA
      Agendamento_futuro
      ERPVeterinario_Fase2
        Prontuario_eletronico
        Emissao_de_CVI
        Habilitacao_como_parceira
    AeroportoFase3
      SmartGate
        Leitura_RFID_Bluetooth
        Validacao_Apto_Inapto
      API_ANAC
      Dashboard_companhia_aerea
    Infraestrutura
      AuthService
        JWT_OAuth2
        Roles_tutor_vet_airline
      NotificationService
        Firebase_FCM
        Email_SendGrid
      PaymentService
        Mercado_Pago
        Assinatura_SaaS
        Publicidade_contextual
      BlockchainFuturo
        Polygon_Network
        Smart_Contracts
        Prova_de_autenticidade
```

---

## 3. Domain-Driven Design — Bounded Contexts {#ddd}

```mermaid
graph TB
  subgraph CORE["⭐ Core Domain"]
    PP["🐾 Pet Pass\n(Smart Pet Pass)\n—\nPassaporte Digital\nDocumentos\nAutenticação"]
    CE["🔬 Compliance Engine\n—\nKnowledge Base\nMotor de Roadmap\nRegras por Destino"]
  end

  subgraph SUPPORTING["🔧 Supporting Domains"]
    TP["✈️ Travel Planner\n—\nDestinos\nCias Aéreas\nSugestões\nHotéis"]
    CV["🏥 Veterinary\n—\nClínicas Parceiras\nAgendamento\nCVI"]
    NO["🔔 Notifications\n—\nFCM\nE-mail\nSMS"]
  end

  subgraph GENERIC["⚙️ Generic Domains"]
    AU["🔑 Auth\n—\nJWT / OAuth2\nRoles & Permissions"]
    PA["💳 Payments\n—\nMercado Pago\nAssinaturas"]
    GE["📍 Geo\n—\nGoogle Maps API\nGeolocalização"]
  end

  subgraph EXTERNAL["🌍 ACL — Sistemas Externos"]
    MAPA["MAPA / VIGIAGRO"]
    AQS["Japan AQS"]
    CDC["CDC / USDA APHIS"]
    FCM["Firebase FCM"]
    MP["Mercado Pago"]
    MAPS["Google Maps"]
    POLY["Polygon Blockchain"]
  end

  PP --> CE
  CE --> TP
  TP --> CV
  TP --> GE
  CV --> GE
  NO --> FCM
  PA --> MP
  GE --> MAPS
  CE -.->|"ACL consulta"| MAPA
  CE -.->|"ACL consulta"| AQS
  CE -.->|"ACL consulta"| CDC
  PP -.->|"futura integração"| POLY
```

### Descrição por Contexto

| Contexto | Tipo | Responsabilidade | Entidades Principais |
|----------|------|-----------------|----------------------|
| **Pet Pass** | Core | Identidade digital do pet + passaporte sanitário | `Pet`, `DocumentoSanitario`, `PassaportePet` |
| **Compliance Engine** | Core | Regras sanitárias por destino + roadmap inverso | `RegrasDestino`, `RoadmapCompliance`, `TarefaRoadmap` |
| **Travel Planner** | Supporting | Planejamento de viagem + sugestões + hotéis | `PlanoViagem`, `RegrasCompanhiaAerea`, `SugestaoDestino`, `HotelPet` |
| **Veterinary** | Supporting | Clínicas parceiras + agendamento + emissão de CVI | `Clinica`, `Agendamento`, `CVI` |
| **Notifications** | Supporting | Alertas de prazo + push + email | `Notificacao`, `Template` |
| **Auth** | Generic | Autenticação e autorização multi-role | `Usuario`, `Role`, `Token` |
| **Payments** | Generic | Assinaturas + cobranças | `Assinatura`, `Fatura` |
| **Geo** | Generic | Geolocalização + busca por proximidade | `Coordenadas`, `PlaceResult` |

---

## 4. Arquitetura de Microserviços {#microservicos}

```mermaid
graph LR
  subgraph CLIENTS["Clientes"]
    APP["📱 App Responsável\nReact Native / Expo\n(Fase 1)"]
    WEB["💻 Web Clínicas\nNext.js\n(Fase 2)"]
    GATE["🚪 Smart Gate\nNext.js + RFID BT\n(Fase 3)"]
  end

  subgraph GATEWAY["API Gateway"]
    GW["🌐 API Gateway\n(Kong / AWS API GW)\nAuth • Rate Limit • Routing"]
  end

  subgraph SERVICES["Microserviços"]
    PET["🐾 pet-service\nPort 3001\nCRUD pets\nPassaporte\nDocumentos"]
    COMP["🔬 compliance-service\nPort 3002\nKnowledge Base\nRoadmap Engine\nRegras por país"]
    TRAVEL["✈️ travel-service\nPort 3003\nPlanos de viagem\nCias aéreas\nSugestões\nHotéis"]
    VET["🏥 vet-service\nPort 3004\nClínicas\nAgendamentos\nCVI"]
    NOTIF["🔔 notification-service\nPort 3005\nPush FCM\nEmail\nSMS"]
    AUTH["🔑 auth-service\nPort 3006\nJWT\nOAuth2\nRoles"]
    PAY["💳 payment-service\nPort 3007\nMercado Pago\nAssinaturas"]
  end

  subgraph DATA["Dados"]
    PG[("🐘 PostgreSQL\nRead replicas\npor serviço")]
    REDIS[("⚡ Redis\nCache\nSessions")]
    S3[("☁️ S3 / Supabase\nDocumentos\nFotos")]
    KB[("📚 Compliance KB\nJSON no Git\nGerado em TS")]
  end

  subgraph INFRA["Infraestrutura"]
    BUS["📨 Message Bus\nRabbitMQ / SQS\nEventos assíncronos"]
    BLOCK["⛓️ Polygon\nBlockchain\n(futuro)"]
  end

  APP --> GW
  WEB --> GW
  GATE --> GW
  GW --> AUTH
  GW --> PET
  GW --> COMP
  GW --> TRAVEL
  GW --> VET
  GW --> NOTIF
  GW --> PAY

  PET --> PG
  PET --> S3
  COMP --> KB
  COMP --> PG
  TRAVEL --> PG
  VET --> PG
  NOTIF --> REDIS
  AUTH --> REDIS
  PAY --> PG

  COMP -->|"evento: prazo_proximo"| BUS
  BUS -->|"trigger"| NOTIF
  PET -->|"evento: doc_uploaded"| BUS
  BUS -->|"trigger"| COMP

  PET -.->|"futura integração"| BLOCK
```

### Responsabilidades por Serviço

#### `pet-service` — Identidade do Pet
- CRUD de pets e responsáveis
- Upload e hash SHA-256 de documentos (S3)
- Geração do Passaporte PDF
- Futuramente: registro de hash na blockchain Polygon

#### `compliance-service` — Motor de Compliance
- Serve os dados do compliance-kb (gerado de JSONs curados)
- Recebe `petId + destinoId + dataEmbarque` e retorna roadmap completo
- Expõe endpoint `GET /roadmap/{petId}/{destino}/{dataEmbarque}`
- Expõe endpoint `GET /destinos` e `GET /companhias`
- Publica eventos no bus quando um prazo está próximo

#### `travel-service` — Planejamento de Viagem
- CRUD de planos de viagem
- Listagem de destinos com conteúdo editorial (pet-friendly tips)
- Listagem de hotéis pet (cache Google Places + parceiros)
- Sugestões de destinos com base no perfil do pet

#### `vet-service` — Clínicas Veterinárias
- Busca de clínicas credenciadas (Google Maps + base própria)
- Agendamento de consultas
- (Fase 2) ERP: prontuários, emissão de CVI, habilitação de parceria

#### `notification-service` — Notificações
- Lembra responsáveis de prazos críticos via push FCM
- Templates de e-mail para onboarding e alertas
- Agenda lembretes com base nos dados do roadmap

#### `auth-service` — Autenticação
- JWT stateless com refresh tokens
- Roles: `TUTOR`, `VET`, `AIRLINE_AGENT`, `ADMIN`
- (Futuro) OAuth2 com Google / Apple Sign In

#### `payment-service` — Pagamentos
- Assinaturas via Mercado Pago Subscriptions
- Planos: Free (1 pet), Pro (até 5 pets), Clinic (por clínica)
- Webhooks de pagamento confirmado

---

## 5. Fluxo de Dados — Jornada do Responsável {#fluxo}

```mermaid
sequenceDiagram
  actor R as Responsável
  participant APP as App iPet
  participant AUTH as auth-service
  participant PET as pet-service
  participant COMP as compliance-service
  participant TRAVEL as travel-service
  participant VET as vet-service
  participant NOTIF as notification-service

  R->>APP: Cadastro (nome, email, senha)
  APP->>AUTH: POST /register
  AUTH-->>APP: JWT token

  R->>APP: Cadastrar pet (raça, peso, vacina, microchip...)
  APP->>PET: POST /pets
  PET-->>APP: Pet criado (id)

  R->>APP: Fazer upload de documentos
  APP->>PET: POST /pets/{id}/documentos
  PET->>PET: calcularHash(SHA-256)
  PET-->>APP: Documento salvo + hash

  R->>APP: Planejar viagem (destino + data embarque)
  APP->>COMP: GET /roadmap/{petId}/{destino}/{data}
  COMP->>COMP: calcularRoadmap(pet, regras, datas)
  COMP-->>APP: RoadmapCompliance (tarefas + status)

  APP->>TRAVEL: GET /sugestoes?destino={id}
  TRAVEL-->>APP: SugestoesDestino + HoteisPet

  APP->>VET: GET /clinicas?lat={}&lng={}
  VET-->>APP: Clínicas próximas credenciadas

  COMP->>NOTIF: evento prazo_proximo(petId, tarefa, data)
  NOTIF->>R: Push FCM "Vacina em 7 dias!"
```

---

## 6. Mapa de Features — Status Atual {#mapa-features}

### Legenda
- ✅ Implementado (neste protótipo)
- 🔨 Em implementação
- 📋 Planejado (próximas sprints)
- 🔮 Futuro (roadmap longo prazo)

### Fase 1 — Responsável pelo Pet

| Feature | Status | Descrição |
|---------|--------|-----------|
| Cadastro de pet | ✅ | Multi-step form: espécie, raça, peso, vacina, sorologia |
| Passaporte Digital | ✅ | Identidade + checklist de saúde + badges de autenticação |
| Upload de documentos | ✅ | Armazenamento local + hash SHA-256 |
| Motor de compliance | ✅ | Roadmap inverso: dado pet + destino + data → tarefas ordenadas |
| Plano de viagem | ✅ | Seleção destino + data embarque + roadmap + salvar |
| 4 destinos no KB | ✅ | Brasil, UE, Japão, EUA (ALTA/MEDIA confidence) |
| 3 cias no KB | ✅ | LATAM, GOL, Azul |
| Compliance KB offline | ✅ | JSONs curados + check-stale.ts + generate-app-data.ts |
| **12 destinos no KB** | 🔨 | + Portugal, UK, Argentina, Chile, Uruguai, Canadá, Austrália, México |
| **9 cias no KB** | 🔨 | + TAP, Air France, Iberia, Copa, American, Emirates |
| Sugestões pet-friendly | 🔨 | Cards editoriais na home com dicas de viagem |
| Hotéis pet | 🔨 | Dois modos: deixar na origem / hospedar no destino |
| Busca de clínicas | 📋 | Google Maps API — CTA já existe na UI |
| Notificações FCM | 📋 | Alertas de prazo no dispositivo |
| Autenticação real | 📋 | JWT + sessão cloud (decisão de stack pendente) |
| Compartilhar passaporte | 📋 | PDF + QR code gerado no client |
| Reputação cias aéreas | 📋 | Avaliações de usuários sobre pet-friendliness |
| Pesquisa de passagens | 🔮 | Skyscanner / API ANAC integração |

### Fase 2 — Clínicas Veterinárias

| Feature | Status | Descrição |
|---------|--------|-----------|
| Portal da clínica (Next.js) | 📋 | Dashboard de pets agendados |
| Prontuário eletrônico | 📋 | Histórico de saúde por pet |
| Emissão de CVI | 📋 | Certificado Veterinário Internacional |
| Habilitação como parceira | 📋 | Cadastro + validação MAPA |
| Pagamento de assinatura | 🔮 | Plano mensal por clínica |

### Fase 3 — Aeroporto / Smart Gate

| Feature | Status | Descrição |
|---------|--------|-----------|
| Protótipo Smart Gate | ✅ | `prototipos/agente-aeroporto/` — Next.js |
| Leitura RFID Bluetooth | 🔮 | Hardware + driver + app React Native |
| API ANAC | 🔮 | Sistema unificado de dados de embarque |
| Dashboard companhia aérea | 🔮 | Relatório de pets embarcados por voo |

---

## 7. Decisões Arquiteturais Registradas {#decisoes}

### ADR-001 — Compliance KB como JSON curado offline
**Contexto:** Não existe API pública unificada para regras sanitárias de animais.  
**Decisão:** KB offline em JSON versionado no Git, revisão humana trimestral obrigatória.  
**Consequência:** Risco de dados desatualizados. Mitigado por: `check-stale.ts`, `REVIEW_GUIDE.md`, `confidence` field.  
**Status:** Aceita ✅

### ADR-002 — Generate pattern para dados do KB no app
**Contexto:** Turbopack (Next.js 16) não permite imports de módulos fora do root do projeto.  
**Decisão:** Script `generate-app-data.ts` lê os JSONs e gera `kb-generated.ts` dentro do projeto.  
**Consequência:** Arquivo gerado deve ser commitado junto com os JSONs. Revisor deve rodar o script.  
**Status:** Aceita ✅

### ADR-003 — Zustand + localStorage (protótipo) → API (produção)
**Contexto:** Protótipo rápido sem backend.  
**Decisão:** Zustand com persist middleware (localStorage). Abstraído: `useAppStore` — trocar implementação sem mudar componentes.  
**Consequência:** Dados perdem em limpeza de browser. Aceitável para fase de validação interna com o time.  
**Status:** Aceita para protótipo ✅ | Revisão obrigatória antes do beta público

### ADR-004 — SHA-256 client-side + campos blockchain pré-moldados
**Contexto:** Autenticação de documentos por blockchain é diferencial competitivo, mas tem custo operacional.  
**Decisão:** Calcular hash SHA-256 no cliente (Web Crypto API). Campos `blockchainTxId` e `blockchainNetwork` já no modelo de dados.  
**Consequência:** Fácil ativação da Polygon quando necessário. Zero custo até lá.  
**Status:** Aceita ✅

### ADR-005 — Stack frontend: React Native/Expo (app final) + Next.js (protótipos)
**Contexto:** Precisamos de demo rápida + URL compartilhável para validação.  
**Decisão:** Protótipos em Next.js mobile-first. App final em React Native/Expo. Serviços (compliance, document) como módulos TS reutilizáveis.  
**Status:** Aceita ✅

### ADR-006 — Microserviços (target) vs. monólito modular (atual)
**Contexto:** Time pequeno + protótipo = overhead de microserviços não justificado agora.  
**Decisão:** Estrutura de código organizada por bounded contexts (DDD), preparada para extração em serviços independentes. A separação em serviços ocorrerá à medida que os times crescerem.  
**Status:** Aceita ✅

---

## 8. Stack por Serviço {#stack}

| Serviço | Runtime | DB | Cache | Notas |
|---------|---------|-----|-------|-------|
| **pet-service** | Node.js + NestJS | PostgreSQL | Redis | S3 para docs |
| **compliance-service** | Node.js + NestJS | PostgreSQL | Redis | KB em JSON/TS |
| **travel-service** | Node.js + NestJS | PostgreSQL | Redis | Google Places API |
| **vet-service** | Node.js + NestJS | PostgreSQL | — | Google Maps API |
| **notification-service** | Node.js + NestJS | — | Redis (queue) | Firebase FCM, SendGrid |
| **auth-service** | Node.js + NestJS | PostgreSQL | Redis (sessions) | JWT, Refresh Tokens |
| **payment-service** | Node.js + NestJS | PostgreSQL | — | Mercado Pago |
| **App Responsável** | React Native + Expo | — | — | Compartilha serviços TS |
| **Web Clínicas** | Next.js + TypeScript | — | — | Tailwind CSS |
| **Infra** | AWS / GCP | RDS PostgreSQL | ElastiCache | K8s ou Railway |

---

*Documento mantido por: CEO (Danielle) + CTO (Victor) + CPO (Brunna) + COO (Leonardo)*  
*Atualizar a cada nova feature ou decisão arquitetural relevante*
