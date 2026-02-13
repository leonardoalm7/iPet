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

## 🎨 _Context Map_: Diagrama

```text
                        [ Cias Aéreas ]
                               ^
                               |
                      ( Customer-Supplier )
                               |
                               |
[ Cadastro Pets ] <---( Shared Kernel )---> [ PET Pass ] ---( Customer-Supplier )---> [ Gestão Saúde ]
      |                                        |
      |                                        |---( ACL )---> [ Mapas / Geo APIs ]
      |                                        |
      |                                        |---( ACL )---> [ Notificações Push ]
      |                                        |
      |                                        v
[ Veterinários ] ----------------------------( ACL )----------------------------> [ Gestão Saúde ]


[ Pagamentos ] ---------------------------( Conformist )------------------------> [ Gateway Financeiro ]
```

## ↔️ Relacionamento Entre Contextos

| Origem           | Destino                             | Tipo de Relacionamento     | Explicação                                                                                                                       |
| :--------------- | :---------------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **PET Pass**     | Gestão de Saúde                     | Customer-Supplier          | O PET Pass depende das validações sanitárias (vacinas, vermífugos e cronogramas) para determinar a aptidão do pet para embarque. |
| **PET Pass**     | Cias. Aéreas                        | Customer-Supplier          | Precisa das regras específicas de cada companhia aérea para validar requisitos de transporte.                                    |
| **PET Pass**     | Cadastro de Pets                    | Shared Kernel              | Compartilham dados essenciais de identificação e biometria dos pets, exigindo consistência entre os contextos.                   |
| **Veterinários** | Gestão de Saúde                     | Anticorruption Layer (ACL) | Protege o domínio sanitário contra formatos heterogêneos de atestados e integrações externas.                                    |
| **PET Pass**     | Mapas / Geolocalização (via Google) | Anticorruption Layer (ACL) | Integrações com APIs externas são isoladas para evitar acoplamento direto ao modelo de domínio.                                  |
| **PET Pass**     | Comunicação / Notificações          | Anticorruption Layer (ACL) | Notificações push são tratadas como serviço externo, preservando a integridade do domínio principal.                             |
| **Pagamentos**   | Gateway financeiro (Mercado Pago)   | Conformist                 | O sistema segue os contratos do provedor financeiro, pois os pagamentos são domínio genérico sem diferencial estratégico.        |
