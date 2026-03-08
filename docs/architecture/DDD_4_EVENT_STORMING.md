# 📌 Roteiro para a Atividade de Event Storming

## **1️⃣ Preparação (5-10 min)**

- Processo central: **Validação de Compliance Sanitário para Embarque Aéreo**

## **2️⃣ Mapeamento de Eventos de Domínio (15-20 min)**

- Pergunta-chave: **"O que acontece no processo?"** _(sempre no passado)_
- Eventos de domínio sugeridos para o fluxo (em ordem cronológica):
  - **Pet Cadastrado**
  - **Vacina Registrada**
  - **Sorologia Registrada**
  - **Destino de Viagem Selecionado**
  - **Compliance Avaliado**
  - **Compliance Reprovado** _(quando regra de carência/sorologia não é atendida)_
  - **Pet Pass Emitido** _(quando regras são atendidas)_
  - **Pendência Sanitária Notificada**
  - **Pet Pass Expirado**

## **3️⃣ Identificação de Comandos e Atores (10-15 min)**

- Pergunta-chave: **"O que causou esse evento?"**
- Relacionar **comandos** com **atores** no contexto:
  - **Cadastrar Pet**
    - **Comando:** "Cadastrar Pet"
    - **Ator:** Responsável
    - **Evento:** "Pet Cadastrado"
  - **Registrar Vacina**
    - **Comando:** "Registrar Vacina"
    - **Ator:** Veterinário/Responsável
    - **Evento:** "Vacina Registrada"
  - **Registrar Sorologia**
    - **Comando:** "Registrar Sorologia"
    - **Ator:** Veterinário
    - **Evento:** "Sorologia Registrada"
  - **Selecionar Destino**
    - **Comando:** "Selecionar Destino"
    - **Ator:** Responsável/Agente de Aeroporto
    - **Evento:** "Destino de Viagem Selecionado"
  - **Avaliar Compliance**
    - **Comando:** "Avaliar Compliance"
    - **Ator:** Sistema PET Pass (motor de regras)
    - **Evento:** "Compliance Avaliado"
  - **Emitir Pet Pass**
    - **Comando:** "Emitir Pet Pass"
    - **Ator:** Sistema PET Pass
    - **Evento:** "Pet Pass Emitido"
  - **Notificar Pendência**
    - **Comando:** "Notificar Pendência"
    - **Ator:** Sistema de Notificações
    - **Evento:** "Pendência Sanitária Notificada"
  - **Escanear Microchip**
    - **Comando:** "Escanear Microchip"
    - **Ator:** Agente de Aeroporto
    - **Evento:** "Microchip Escaneado"

## **4️⃣ Descobrindo Regras e Políticas de Negócio (10-15 min)**

- Pergunta-chave: **"Quais regras precisam ser seguidas nesse processo?"**
- Regras e políticas mapeadas:
  - **Brasil:** exige vacina antirrábica com carência mínima de **21 dias**; sorologia não obrigatória.
  - **União Europeia:** exige vacina válida + sorologia com status **OK** + carência mínima de **90 dias** da coleta.
  - **Japão:** exige vacina válida + sorologia com status **OK** + carência mínima de **180 dias** da coleta.
  - Quando faltar sorologia para UE/Japão, o resultado deve ser **Inapto** com motivo explícito.
  - Um passaporte emitido como apto não deve ser alterado retroativamente; mudanças geram novo ciclo de validação.
  - Notificações de saúde devem considerar janelas de alerta em **7, 3 e 1 dia** antes da próxima dose.
- Integrações externas relevantes:
  - **Push notifications:** Firebase Cloud Messaging.
  - **Calendário:** Google Calendar e Outlook.
  - **Mapas/Clínicas parceiras:** Google Maps API.
  - **Regras regulatórias:** VIGIAGRO e requisitos internacionais por destino.

## **5️⃣ Identificação dos Bounded Contexts (10 min)**

- Pergunta-chave: **"Quem é responsável por cada parte do processo?"**
- Separar eventos e comandos por Bounded Context:
  - **Cadastro de Pets (Supporting):** cadastro e manutenção de identificação, biometria e vínculo com responsável.
  - **Gestão de Saúde (Core):** registros de vacina, antipulgas, vermífugos e sorologia; cálculo de próximas doses.
  - **PET Pass (Core):** avaliação de compliance sanitário e emissão de status apto/inapto para embarque.
  - **Veterinários (Supporting):** validação de profissional e emissão de documentos sanitários.
  - **Cias. Aéreas (Supporting):** regras específicas por companhia/rota para apoio à decisão operacional.
  - **Comunicação/Notificações (externo via ACL):** envio de alertas e lembretes ao responsável.
  - **Geolocalização/Mapas (externo via ACL):** apoio ao fluxo de descoberta de clínicas.

## **6️⃣ Discussão e Refinamento (15 min)**

- Cada grupo apresenta seu fluxo.
<!-- - **Perguntas para discussão:**
  - Há diferenciação clara entre regras de **BRASIL**, **UNIÃO EUROPEIA** e **JAPÃO**?
  - O fluxo cobre os dois cenários: **Apto** e **Inapto** com motivo e data de liberação?
  - Quais eventos devem ser internos e quais devem ser publicados para integração (ex.: companhias aéreas)?
  - Algum comando está no contexto errado (ex.: regra de saúde dentro de cadastro)?
  - Há dependência crítica de integração externa que precisa de fallback/manual? -->
- **Perguntas para discussão:**
  - Há eventos que poderiam ser melhor detalhados?
  - Existem regras de negócio não mapeadas?
  - Algum comando ou evento depende de um sistema externo?
- Refinar o modelo conforme necessário.

## **🎯 Dicas para Facilitar a Atividade**

✅ **Eventos são sempre no passado** e os comandos no presente.  
✅ **O foco é explorar e aprender**, não a perfeição.  
✅ **Usar cores diferentes para cada tipo de post-it** (como na legenda da imagem de Event Storming).  
✅ **Pensar no fluxo real do dia a dia do trabalho** para tornar a atividade mais prática.

## Links Úteis:

✅ https://medium.com/@jonesroberto/event-storming-guia-b%C3%A1sico-216498f5dd2d

✅ https://www.linkedin.com/pulse/o-que-%C3%A9-eventstorming-e-como-este-formato-de-workshop-rodrigues/
