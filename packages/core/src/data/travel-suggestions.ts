/**
 * Sugestões de destinos pet-friendly — dados editoriais curados.
 * Futuro: mover para travel-service com CMS ou banco de dados.
 */

import { SugestaoDestino } from "../domain/types";

export const SUGESTOES_DESTINO: SugestaoDestino[] = [
  // ─── Brasil ───────────────────────────────────────────────────────────────
  {
    id: "gramado-rs",
    nome: "Gramado, RS",
    pais: "Brasil",
    bandeira: "🇧🇷",
    tiposViagem: ["SERRA", "CULTURAL", "CIDADE"],
    descricaoCurta: "A capital pet-friendly do Brasil. Ruas arborizadas, chocolates e frio convidativo.",
    descricaoCompleta:
      "Gramado é reconhecida como uma das cidades mais pet-friendly do Brasil. Praticamente todos os hotéis, restaurantes e lojas da Rua Coberta aceitam animais de estimação. O clima frio da Serra Gaúcha é ideal para passeios longos com cães de qualquer porte. O Lago Negro, o Parque Knorr e as ruas do centro são pontos de passeio obrigatórios. Muitos cafés e restaurantes disponibilizam petiscos e água para os pets.",
    dicas: [
      "Rua Coberta: quase 100% dos estabelecimentos aceitam cães",
      "Hotel Casa da Montanha e Hotel Ritta Höppner são referências pet-friendly",
      "Lago Negro tem circuito de caminhada ideal para cães",
      "Leve um casaco para o pet — temperatura pode cair abaixo de 5°C no inverno",
      "Festival de Natal (Natal Luz) é a melhor época para visitar com pets",
    ],
    melhorEpoca: "Abril a julho (frio e sem turismo de massa) ou dezembro (Natal Luz)",
    imagemEmoji: "⛷️",
    destacado: true,
    destinoCompliance: "BRASIL",
  },
  {
    id: "florianopolis-sc",
    nome: "Florianópolis, SC",
    pais: "Brasil",
    bandeira: "🇧🇷",
    tiposViagem: ["PRAIA", "AVENTURA", "CIDADE"],
    descricaoCurta: "A Ilha da Magia com praias pet-friendly e vida ao ar livre.",
    descricaoCompleta:
      "Florianópolis tem diversas praias que permitem a presença de cães, especialmente fora da temporada. A Praia do Santinho, Campeche e Solidão são as mais populares para ir com pets. A infraestrutura de trilhas, como a Trilha da Costa da Lagoa, é ideal para cães aventureiros. A cidade tem uma cultura muito aberta para animais, com pet shops, clínicas e espaços caninos espalhados pela ilha.",
    dicas: [
      "Praias pet-friendly: Santinho, Campeche, Solidão (verificar regras por temporada)",
      "Evitar alta temporada (dezembro-fevereiro) — praias têm restrições de acesso",
      "Trilha da Costa da Lagoa é excelente para cães de médio e grande porte",
      "Bairro Lagoa da Conceição tem vários bares e restaurantes pet-friendly",
      "Levar coleira, guia e lembrar da lei de muzzle em locais movimentados",
    ],
    melhorEpoca: "Março a novembro (fora da alta temporada)",
    imagemEmoji: "🏄",
    destacado: true,
    destinoCompliance: "BRASIL",
  },
  {
    id: "campos-do-jordao-sp",
    nome: "Campos do Jordão, SP",
    pais: "Brasil",
    bandeira: "🇧🇷",
    tiposViagem: ["SERRA", "CULTURAL", "AVENTURA"],
    descricaoCurta: "O Switzerland brasileiro. Trilhas, cachoeiras e frio autêntico de serra.",
    descricaoCompleta:
      "Campos do Jordão é o destino de montanha mais próximo de São Paulo e oferece uma estrutura turística muito aberta para pets. O Horto Florestal oferece trilhas marcadas, e o centro da cidade (Capivari) tem muitos cafés e lojas que aceitam cães. A Pedra do Baú e as cachoeiras ao redor são pontos de aventura para donos e pets ativos.",
    dicas: [
      "Horto Florestal tem trilhas variadas — cães devem estar na guia",
      "Rua Djalma Forjaz (centro de Capivari) tem vários estabelecimentos pet-friendly",
      "Pedra do Baú: trilha longa — ideal para cães com boa condição física",
      "Festival de Inverno (julho) é épico mas com muito movimento — avalie se vale",
      "Pousadas no entorno do centro são geralmente mais flexíveis que hotéis de rede",
    ],
    melhorEpoca: "Junho a agosto (inverno com frio intenso) ou maio/setembro",
    imagemEmoji: "🏔️",
    destacado: false,
    destinoCompliance: "BRASIL",
  },
  {
    id: "bonito-ms",
    nome: "Bonito, MS",
    pais: "Brasil",
    bandeira: "🇧🇷",
    tiposViagem: ["AVENTURA", "CAMPO"],
    descricaoCurta: "Capital do ecoturismo brasileiro. Rios de cristal, snorkel e natureza intocada.",
    descricaoCompleta:
      "Bonito é destino de ecoturismo com foco em preservação. Embora muitos atrativos naturais tenham restrições para animais (para preservação da fauna local), a cidade em si é acolhedora para pets e há opções de passeio adequadas. Ideal para responsáveis que querem aliar natureza a descanso com o pet.",
    dicas: [
      "A maioria dos atrativos naturais (rios) NÃO permite cães — confirmar antes",
      "Pousadas fazenda no entorno geralmente têm espaço aberto para pets grandes",
      "Ideal para cães habituados ao calor — verão pode chegar a 40°C",
      "Trilhas eco-turísticas do tipo 'Estrada Parque' permitem cães na guia",
    ],
    melhorEpoca: "Abril a outubro (seca, mais fácil acesso aos atrativos)",
    imagemEmoji: "🤿",
    destacado: false,
    destinoCompliance: "BRASIL",
  },
  {
    id: "paraty-rj",
    nome: "Paraty, RJ",
    pais: "Brasil",
    bandeira: "🇧🇷",
    tiposViagem: ["CULTURAL", "PRAIA", "AVENTURA"],
    descricaoCurta: "Centro histórico colonial, cachoeiras e ilhas numa das regiões mais bonitas do Brasil.",
    descricaoCompleta:
      "Paraty encanta pela combinação de centro histórico tombado pela UNESCO, praias paradisíacas e Mata Atlântica preservada. Cães são bem-vindos nas praias de barco e nas cachoeiras ao redor. O centro histórico tem muitos restaurantes que aceitam pets na área externa.",
    dicas: [
      "Passeios de barco às ilhas: muitos barqueiros aceitam cães de médio porte",
      "Cachoeira do Tobogã e Cachoeira do Poço Verde permitem cães",
      "Centro histórico: apenas passeio a pé — ruas de pedra são desafio para certos cães",
      "Festival Literário (FLIP) e Festa do Divino lotam a cidade — prefira outras épocas",
    ],
    melhorEpoca: "Março a junho (menos calor, menos chuva e menos turismo)",
    imagemEmoji: "⛵",
    destacado: false,
    destinoCompliance: "BRASIL",
  },

  // ─── Internacional ────────────────────────────────────────────────────────
  {
    id: "amsterdam-nl",
    nome: "Amsterdam, Holanda",
    pais: "Países Baixos",
    bandeira: "🇳🇱",
    tiposViagem: ["CULTURAL", "CIDADE"],
    descricaoCurta: "Uma das cidades mais pet-friendly do mundo. Canais, bicicletas e cães por toda parte.",
    descricaoCompleta:
      "Amsterdam é famosa por aceitar cães em praticamente todos os lugares: cafés, restaurantes, museus e até no metrô e nos trens. Os famosos canais têm percursos de passeio ideais, e os parques como o Vondelpark são pontos de encontro de cães de toda a cidade. A cultura holandesa é extremamente acolhedora para pets.",
    dicas: [
      "Vondelpark: o parque mais pet-friendly de Amsterdam — cães podem correr livres em áreas demarcadas",
      "Metrô e trens NS aceitam cães com bilhete especial (Hondenkaartje)",
      "Maioria dos cafés e restaurantes aceitam cães — confirmar na entrada",
      "Lembre que precisa cumprir os requisitos da UE (microchip + sorologia + CVI)",
      "Seguro de saúde pet para viagem internacional é altamente recomendado",
    ],
    melhorEpoca: "Abril a setembro (campos de tulipas e clima ameno)",
    imagemEmoji: "🌷",
    destacado: true,
    destinoCompliance: "HOLANDA",
  },
  {
    id: "barcelona-es",
    nome: "Barcelona, Espanha",
    pais: "Espanha",
    bandeira: "🇪🇸",
    tiposViagem: ["CULTURAL", "PRAIA", "CIDADE"],
    descricaoCurta: "Gaudi, praias, tapas e uma cultura que adora cães. Pet-friendly ao extremo.",
    descricaoCompleta:
      "Barcelona é uma das capitais europeias mais pet-friendly. Há praias específicas para cães como a Platja de Llevant (área dog-friendly), parques como o Parc de la Ciutadella onde cães são bem-vindos, e dezenas de restaurantes com terraço que aceitam pets. O metrô barcelonês aceita animais em determinados horários.",
    dicas: [
      "Platja de Llevant tem área específica para banho de mar com cães",
      "Parc de la Ciutadella: ideal para passeios longos",
      "Metro: cães aceitos fora dos horários de pico (verificar regras TMB)",
      "A documentação UE é obrigatória — microchip, sorologia e CVI",
      "Muitos hotéis no Eixample aceitam cães com taxa adicional",
    ],
    melhorEpoca: "Maio a outubro (clima mediterrâneo perfeito)",
    imagemEmoji: "🏖️",
    destacado: false,
    destinoCompliance: "ESPANHA",
  },
  {
    id: "lisboa-pt",
    nome: "Lisboa, Portugal",
    pais: "Portugal",
    bandeira: "🇵🇹",
    tiposViagem: ["CULTURAL", "CIDADE"],
    descricaoCurta: "Fado, pastéis de nata e cidades que amam animais. O destino favorito dos brasileiros na Europa.",
    descricaoCompleta:
      "Lisboa é o destino europeu mais popular entre os brasileiros, e com razão — o idioma, a cultura e a hospitalidade tornam a adaptação muito fácil. A cidade tem parques como o Monsanto e o Jardim da Estrela, onde cães podem passear livremente. Muitos restaurantes e cafés têm áreas externas que aceitam pets. O Algarve, a 3h de Lisboa, é repleto de praias pet-friendly.",
    dicas: [
      "Jardim da Estrela e Monsanto são os parques mais pet-friendly de Lisboa",
      "Metrô de Lisboa: cães pequenos aceitos em transportadora",
      "Alfama e Belém têm muitas opções de passeio a pé com pets",
      "Algarve (Sagres, Lagos): muitas praias aceitam cães fora da temporada",
      "Documentação UE é obrigatória — iniciar o processo 90+ dias antes",
    ],
    melhorEpoca: "Março a junho ou setembro a novembro (sem calor extremo e menos turistas)",
    imagemEmoji: "🛤️",
    destacado: true,
    destinoCompliance: "PORTUGAL",
  },
  {
    id: "buenos-aires-ar",
    nome: "Buenos Aires, Argentina",
    pais: "Argentina",
    bandeira: "🇦🇷",
    tiposViagem: ["CULTURAL", "CIDADE"],
    descricaoCurta: "A Paris do Sul. Tango, steakhouses e uma cultura que adora cachorro.",
    descricaoCompleta:
      "Buenos Aires é uma das cidades mais pet-friendly da América Latina. Os porteños adoram cães e é muito comum ver pets em restaurantes, cafés e parques. O Bosques de Palermo tem área enorme para cães correrem livres. A cidade tem uma indústria de passeadores de cães (paseadores) muito desenvolvida — ideal para viagens de trabalho onde o pet precisa de companhia durante o dia.",
    dicas: [
      "Bosques de Palermo: parque gigante com áreas livres para cães",
      "Bairro Palermo tem dezenas de restaurantes e cafés dog-friendly",
      "Paseadores (passeadores) profissionais abundam — app Guau é o mais popular",
      "Metrô (Subte) não aceita cães exceto guias — usar taxi ou Uber",
      "Processo aduaneiro simples: vacina antirrábica + CVI",
    ],
    melhorEpoca: "Setembro a novembro (primavera argentina) ou março a maio (outono)",
    imagemEmoji: "💃",
    destacado: false,
    destinoCompliance: "ARGENTINA",
  },
];

export const SUGESTOES_DESTACADAS = SUGESTOES_DESTINO.filter((s) => s.destacado);
export const SUGESTOES_BRASIL = SUGESTOES_DESTINO.filter((s) => s.pais === "Brasil");
export const SUGESTOES_INTERNACIONAL = SUGESTOES_DESTINO.filter((s) => s.pais !== "Brasil");
