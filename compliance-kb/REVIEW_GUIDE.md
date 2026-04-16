# iPet Compliance KB — Guia de Revisão

## Por que este guia existe

As regras sanitárias para viagem de pets têm consequências reais: um animal pode ser barrado no aeroporto, ficar em quarentena ou ser deportado. **A iPet assume responsabilidade moral (e futuramente legal) pela precisão dessas informações.** Este guia garante que a equipe saiba exatamente quando e como revisar cada regra.

---

## Frequência de revisão

| Tipo de regra | Frequência | Motivo |
|---------------|-----------|--------|
| **Destinos (saúde animal)** | Trimestral | Legislação sanitária muda lentamente, mas muda |
| **Companhias aéreas** | Trimestral | Políticas de pets mudam com mais frequência |
| **Qualquer regra com confiança MEDIA/BAIXA** | Na próxima sprint | Precisa upgrade para ALTA antes de ir para produção |

---

## Checklist de revisão — Destinos

Para cada arquivo em `destinations/`:

- [ ] Acessar todas as URLs listadas em `sources[]` e verificar se ainda carregam
- [ ] Comparar as regras atuais do site com o que está no JSON
- [ ] Verificar se houve mudança de legislação (buscar por "atualização" ou changelog no site)
- [ ] Para UE: verificar Regulamento 576/2013 e atualizações no EUR-Lex
- [ ] Para Japão: verificar site do AQS se houve mudança de países aceitos
- [ ] Para EUA: verificar CDC Importation se houve mudança na classificação de risco do Brasil
- [ ] Atualizar `lastVerified`, `verifiedBy` e `nextReviewDate` (+90 dias)
- [ ] Se houve mudança de regra: adicionar entrada no `changeLog` com data, autor e descrição
- [ ] Se a confiança era MEDIA/BAIXA e foi confirmada em fonte oficial: upgrade para ALTA

---

## Checklist de revisão — Companhias Aéreas

Para cada arquivo em `airlines/`:

- [ ] Acessar URL da companhia e verificar se a página ainda existe
- [ ] Verificar se houve mudança nos limites de peso (animal + caixa)
- [ ] Verificar se houve mudança nas dimensões máximas da caixa
- [ ] Verificar se a política de raças braquicefálicas mudou
- [ ] Verificar se há novas restrições por rota ou aeronave
- [ ] Atualizar `lastVerified`, `verifiedBy` e `nextReviewDate`
- [ ] Adicionar ao `changeLog` se algo mudou

---

## Como verificar se o script de staleness está funcionando

```bash
# No diretório raiz do repo:
npx ts-node compliance-kb/scripts/check-stale.ts
```

O script mostrará:
- 🔴 Regras com revisão vencida
- 🟡 Revisões nos próximos 30 dias
- 🟠 Regras com confiança BAIXA

---

## Como adicionar um novo destino

1. Copiar `destinations/brasil.json` como template
2. Preencher TODOS os campos obrigatórios do schema
3. `confidence`: começar como `"MEDIA"` — só colocar `"ALTA"` após confirmar em fonte oficial
4. `observacoesInternas`: usar para dúvidas, pontos a verificar, alertas para o time
5. Rodar o script de check para garantir que não está stale
6. Abrir PR com o novo arquivo — incluir no corpo do PR as fontes verificadas

---

## Como reportar uma mudança de regra

Se você ou um usuário identificar que uma regra está desatualizada:

1. Abrir issue no GitHub com label `compliance-update`
2. Incluir: qual regra mudou, qual era, qual é agora, fonte oficial
3. Atribuir ao responsável de curadoria
4. Após correção: commit no `compliance-kb/` + entrada no `changeLog`
5. Bump da versão da regra se for mudança breaking

---

## Responsáveis

| Função | Responsabilidade |
|--------|-----------------|
| **CEO (Danielle)** | Visão estratégica e aprovação final |
| **CTO (Victor)** | Integração das regras atualizadas no app |
| **CPO (Brunna)** | Definição de impacto no produto |
| **COO (Leonardo)** | Coordenação geral e curadoria do KB |

---

## Fontes de referência rápida

| País/Região | Fonte principal |
|-------------|----------------|
| Brasil (exportação) | https://www.gov.br/agricultura — MAPA/VIGIAGRO |
| União Europeia | https://ec.europa.eu/food/animals/pet-movement |
| Japão | https://www.maff.go.jp/aqs/english/animal/dog |
| EUA | https://www.cdc.gov/importation + https://www.aphis.usda.gov |
| LATAM | https://www.latamairlines.com/br/pt/central-de-ajuda |
| GOL | https://www.voegol.com.br/informacoes/animais-de-estimacao |
| Azul | https://www.voeazul.com.br/informacoes/animais |
