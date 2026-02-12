# Modelagem Domain-Driven Design (DDD) - Ecossistema iPet - Parte 2 🐾

Este documento detalha a visão técnica e estratégica de design do sistema, focando na decomposição do domínio para garantir escalabilidade e clareza nas regras de negócio.

## ⭕️ Bounded Contexts

### 🧠 Core Domains (núcleo do negócio)

- **PET Pass**
  Gestão do passaporte sanitário digital e status de aptidão para embarque.

- **Gestão de Saúde**
  Controle e validação sanitária (vacinas, vermífugos, cronogramas médicos).

### 🧩 Supporting Domains (suporte ao core)

- **Cadastro de Pets**
  Manutenção de dados biométricos e cadastrais dos animais.

- **Veterinários**
  Validação de profissionais e emissão de atestados digitais.

- **Cias. Aéreas**
  Configuração de regras específicas por companhia e aeronave.

### ⚙️ Generic Domain (infraestrutura comum)

- **Pagamentos**
  Processamento financeiro via gateway de pagamento.

### 🌐 Contextos técnicos externos

- **Geolocalização & Mapas**
  Integração com serviços da Google.

- **Comunicação/Notificações**
  Alertas push relacionados à saúde e status sanitário.
