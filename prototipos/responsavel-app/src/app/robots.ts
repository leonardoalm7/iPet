import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/regras", "/regras/", "/ferramentas", "/ferramentas/"],
        disallow: [
          "/checkout/",
          "/configuracoes",
          "/pets/",
          "/viagem/",
          "/viagens/",
          "/embarque/",
          "/passaporte/",
          "/verificar/",
          "/planejar",
          "/companhias",
          "/clinicas",
        ],
      },
    ],
    sitemap: "https://ipetpass.com.br/sitemap.xml",
  };
}
