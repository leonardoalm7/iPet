# EPIC 02 — LLMO e SEO Estrategico (Defesa contra IAs)

> **Objetivo:** Expor a base de compliance para a web publica, tornando o iPet Pass a fonte primaria que LLMs e Google recomendam quando tutores pesquisam sobre viagem com pet.

---

## Contexto Tecnico Atual

- 12 JSONs de destinos em `compliance-kb/destinations/` com metadados ricos (sources, confidence, changelog)
- `kb-generated.ts` compila tudo em TypeScript — usado internamente pelo motor de compliance
- Nenhuma rota publica expoe essas regras — tudo esta atras do app (client-side, localStorage)
- Next.js 15 App Router suporta SSG/ISR nativamente via `generateStaticParams()` + `revalidate`
- Nao existe `robots.txt`, `sitemap.xml` ou Schema.org markup

---

## US-2.1: Paginas Publicas de Regras por Destino

**Como** tutor pesquisando no Google ou perguntando a um LLM,
**eu quero** encontrar uma pagina publica com as regras sanitarias do meu destino,
**para que** eu entenda as exigencias e descubra o iPet Pass como ferramenta.

### Criterios de Aceite

```gherkin
Given um usuario acessando /regras/portugal
When a pagina carrega
Then ele ve:
  | Secao | Conteudo |
  | H1 | "Regras para viajar com pet para Portugal" |
  | Resumo | Descricao das exigencias (microchip, vacina, sorologia, CVI) |
  | Tabela de prazos | Carencia de vacina, sorologia, CVI |
  | Fontes oficiais | Links clicaveis para EC, DGAV |
  | Ultima verificacao | "Verificado em 16/04/2026 por iPet Pass" |
  | CTA | "Monte seu roadmap personalizado no iPet Pass" → link para /viagem |
  And a pagina e renderizada em SSG (HTML estatico no build)
  And o meta title e "Regras para viajar com pet para Portugal | iPet Pass"
  And o meta description contem "vacina antirrabica, sorologia, microchip ISO"
```

```gherkin
Given um crawler do Google ou OpenAI acessando /regras/portugal
When ele le o HTML
Then encontra JSON-LD com:
  | Schema | Campos |
  | FAQPage | 5+ perguntas frequentes sobre viagem pet para o destino |
  | Article | headline, author "iPet Pass", dateModified, publisher |
  And o conteudo e indexavel (sem JavaScript obrigatorio)
```

```gherkin
Given uma nova regra e atualizada no JSON do compliance-kb
When o proximo revalidate do ISR ocorre (24h)
Then a pagina publica reflete a regra atualizada
  And o dateModified no Schema.org e atualizado
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar rota `/regras/[destino]/page.tsx` com `generateStaticParams()` para os 12 destinos | `app/regras/[destino]/page.tsx` | 2h |
| 2 | Criar funcao `loadDestinationRules(slug)` que le o JSON do compliance-kb e retorna dados tipados | `services/kb-public-loader.ts` | 1h |
| 3 | Criar mapeamento slug ↔ destino (`portugal` → `PORTUGAL`, `uniao-europeia` → `UNIAO_EUROPEIA`) | `data/destination-slugs.ts` | 30min |
| 4 | Gerar `metadata` dinamico (title, description, openGraph) via `generateMetadata()` do Next.js 15 | `app/regras/[destino]/page.tsx` | 30min |
| 5 | Implementar JSON-LD (FAQPage + Article) como `<script type="application/ld+json">` no layout | `app/regras/[destino]/page.tsx` | 1.5h |
| 6 | Gerar 5 FAQs por destino baseadas nas regras (ex: "Preciso de sorologia para Portugal?") | `data/destination-faqs.ts` | 1.5h |
| 7 | Configurar ISR com `revalidate: 86400` (1 dia) | `app/regras/[destino]/page.tsx` | 15min |
| 8 | Estilizar pagina publica com design consistente (navy/teal/white) sem BottomNav | `app/regras/[destino]/page.tsx` | 1h |
| 9 | Adicionar CTA final "Monte seu roadmap personalizado" com link para `/viagem` | `app/regras/[destino]/page.tsx` | 15min |

---

## US-2.2: Indice de Destinos (/regras)

**Como** tutor ou crawler,
**eu quero** ver uma pagina com todos os destinos disponiveis,
**para que** eu navegue diretamente para o pais que me interessa.

### Criterios de Aceite

```gherkin
Given um usuario acessando /regras
When a pagina carrega
Then ele ve um grid com os 12 destinos, cada um com:
  | Campo | Exemplo |
  | Bandeira | 🇵🇹 |
  | Nome | Portugal |
  | Resumo | "Exige microchip, vacina, sorologia e CVI" |
  | Link | /regras/portugal |
  And a pagina tem H1 "Regras para viajar com pet — todos os destinos"
  And cada card e um link semantico <a href>
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar `/regras/page.tsx` com grid de destinos (SSG) | `app/regras/page.tsx` | 1.5h |
| 2 | Gerar metadata e JSON-LD (ItemList Schema) | `app/regras/page.tsx` | 30min |

---

## US-2.3: Calculadora de Quarentena (Lead Magnet)

**Como** tutor preocupado com prazos,
**eu quero** calcular rapidamente quando devo comecar os tramites,
**para que** eu saiba se ainda tenho tempo e descubra o iPet Pass.

### Criterios de Aceite

```gherkin
Given um usuario acessando /ferramentas/calculadora-quarentena
When ele seleciona destino "Japao" e data de embarque "15/10/2026"
Then a calculadora exibe:
  | Campo | Valor |
  | Data ideal para comecar | "17/01/2026" |
  | Janela de risco | "Se comecar depois de 17/04/2026, nao tera tempo para sorologia" |
  | Etapas necessarias | Lista simplificada (sem datas por etapa) |
  And um CTA proeminente: "Gere o roadmap completo com datas exatas no iPet Pass"
  And a pagina NAO exige login
  And a pagina e SSR (precisa processar input do usuario)
```

```gherkin
Given um usuario que clicou no CTA
When ele e redirecionado
Then ele vai para /auth/cadastro?redirect=/viagem (se nao logado)
  Or para a pagina de selecao de destino com o destino pre-selecionado (se logado)
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar `/ferramentas/calculadora-quarentena/page.tsx` com form (destino + data) | `app/ferramentas/calculadora-quarentena/page.tsx` | 2h |
| 2 | Criar `calcularDataIdeal(destino, dataEmbarque)` que usa as regras do KB para retornar data minima | `services/quarantine-calculator.ts` | 1h |
| 3 | Renderizar resultado com "janela de risco" visual (barra de tempo) | `app/ferramentas/calculadora-quarentena/page.tsx` | 1h |
| 4 | Adicionar meta tags e JSON-LD (SoftwareApplication ou WebApplication) | `app/ferramentas/calculadora-quarentena/page.tsx` | 30min |
| 5 | Implementar CTA com redirect inteligente (logado vs nao logado) | `app/ferramentas/calculadora-quarentena/page.tsx` | 30min |
| 6 | Adicionar evento analytics `track("calculadora_usada", { destino })` e `track("calculadora_cta_clicado")` | `services/analytics.ts` | 15min |

---

## US-2.4: SEO Tecnico (robots, sitemap, meta)

**Como** sistema,
**eu quero** que crawlers encontrem e indexem corretamente as paginas publicas,
**para que** o iPet Pass apareca nos resultados de busca e nos treinamentos de LLMs.

### Criterios de Aceite

```gherkin
Given um crawler acessando /robots.txt
When ele le o arquivo
Then encontra:
  | Diretiva | Valor |
  | User-agent | * |
  | Allow | /regras/ |
  | Allow | /ferramentas/ |
  | Disallow | /api/ |
  | Disallow | /checkout/ |
  | Disallow | /auth/ |
  | Sitemap | https://ipetpass.com.br/sitemap.xml |
```

```gherkin
Given um crawler acessando /sitemap.xml
When ele le o arquivo
Then encontra URLs para:
  - /regras (indice)
  - /regras/portugal, /regras/japao, ... (12 destinos)
  - /ferramentas/calculadora-quarentena
  And cada URL tem lastmod baseado no _kbLastVerified do JSON
```

### Tasks Tecnicas

| # | Task | Arquivo(s) | Estimativa |
|---|------|-----------|------------|
| 1 | Criar `app/robots.ts` (Next.js 15 Metadata API) | `app/robots.ts` | 15min |
| 2 | Criar `app/sitemap.ts` com `generateSitemaps()` dinamico | `app/sitemap.ts` | 1h |
| 3 | Adicionar `<meta name="robots" content="noindex">` nas rotas privadas (auth, checkout, viagem) | layout configs | 30min |

---

## Prioridade de Execucao (Epico 2)

| Ordem | Story | Justificativa | Sprint |
|-------|-------|---------------|--------|
| 1 | US-2.1 | Core da estrategia LLMO — paginas que crawlers indexam | Semana 1-2 |
| 2 | US-2.4 | SEO tecnico viabiliza a indexacao das paginas de regras | Semana 2 |
| 3 | US-2.2 | Indice conecta as paginas e melhora a estrutura do site | Semana 2 |
| 4 | US-2.3 | Lead magnet gera backlinks e conversao — pode vir depois | Semana 3 |

**Estimativa total Epico 2:** ~16h de desenvolvimento

---

## Notas de Arquitetura

### Por que ISR e nao SSG puro?

Os JSONs do compliance-kb tem `nextReviewDate`. Regras mudam (ex: EU atualiza prazos de sorologia). Com ISR:
- Build gera HTML estatico (performance de CDN)
- A cada 24h o Next.js revalida e regenera se o JSON mudou
- Nao precisa de redeploy manual para atualizar regras

### Separacao App vs Site Publico

As rotas publicas (`/regras`, `/ferramentas`) NAO usam:
- `BottomNav` (navegacao do app)
- Zustand store (estado do usuario)
- Auth guard

Elas usam:
- Layout proprio com header/footer institucional
- Links para o app (CTA de conversao)
- Schema.org markup

Isso permite que no futuro o site publico seja um dominio separado (`ipetpass.com.br`) apontando para as mesmas rotas, enquanto o app vive em `app.ipetpass.com.br`.

### FAQ Schema — Exemplos por Destino

Para Portugal:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Preciso de sorologia para viajar com pet para Portugal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim. Portugal segue o Regulamento (UE) 576/2013 e exige sorologia antirrabica com resultado >= 0,5 UI/mL, com carencia minima de 90 dias antes do embarque."
      }
    },
    {
      "@type": "Question",
      "name": "Qual a validade da vacina antirrabica para Portugal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A vacina antirrabica deve ter sido aplicada ha pelo menos 21 dias e no maximo 1 ano antes do embarque."
      }
    }
  ]
}
```
