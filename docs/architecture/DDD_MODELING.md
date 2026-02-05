# Modelagem Domain-Driven Design (DDD) - Ecossistema iPet 🐾

Este documento detalha a visão técnica e estratégica de design do sistema, focando na decomposição do domínio para garantir escalabilidade e clareza nas regras de negócio.

## 🎯 Objetivo Operacional
Automatizar a validação sanitária para transporte aéreo, transformando processos manuais em um fluxo digital ágil, reduzindo erros humanos e garantindo conformidade regulatória em tempo real.

## 🏗️ Mapa de Subdomínios
Para o ecossistema **iPet**, identificamos a seguinte separação de domínios:

| Subdomínio | Categoria | Responsabilidade Principal |
| :--- | :--- | :--- |
| **PET Pass** | **Core Domain** | Gestão do passaporte virtual, consolidando status de aptidão para embarque. |
| **Gestão de Saúde** | **Core Domain** | Validação estruturada de vacinas, vermífugos e cronogramas médicos. |
| **Cadastro de Pets** | Supporting | Manutenção dos dados biométricos e cadastrais dos animais. |
| **Veterinários** | Supporting | Validação de profissionais e emissão de atestados digitais. |
| **Cias Aéreas** | Supporting | Configuração de regras específicas por companhia e aeronave. |
| **Pagamentos** | Generic | Processamento de transações e assinaturas via Mercado Pago. |

## 🗣️ Linguagem Ubíqua (Dicionário do Ecossistema)
* **Pet Pass**: O produto central; um passaporte digital imutável que centraliza identificação e saúde.
* **Compliance Sanitário**: O conjunto de regras que determina se um Pet está "Apto" ou "Inapto" para um trecho específico.
* **Tutor**: O responsável legal pelo animal e usuário principal do Super App.
* **CSaaS**: *Compliance Sanitário as a Service* – o modelo de negócio que sustenta o ecossistema.

## 🛠️ Stack Estratégica
* **Mapas e Geolocalização**: Google Maps API para busca de clínicas parceiras.
* **Comunicação**: Firebase Cloud Messaging para alertas push de saúde.
* **Infraestrutura**: Modelo escalável para suporte a múltiplos parceiros (B2B).

---
**Documento de Design de Sistema** | MBA Software Engineering - FIAP
*Contribuição: Brunna Rosa (CPO) | Organização: Leonardo Braga (COO)*