export const metadata = { title: "Política de Privacidade — iPet" };

export default function PrivacidadePage() {
  return (
    <article className="text-ink/75 leading-relaxed text-[14px]">
      <p className="kicker text-terracotta">Documento legal</p>
      <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
        Política de privacidade
      </h1>
      <p className="text-[11px] font-mono text-muted mt-3 tracking-wider">
        v1.0.0 · vigente desde 1 de abril de 2026 · LGPD (Lei nº 13.709/2018)
      </p>

      <div className="editorial-rule my-10" />

      <div className="space-y-10">
        <Section numero="01" titulo="Controlador">
          <p>
            iPet Tecnologia LTDA — CNPJ XX.XXX.XXX/0001-XX — São Paulo, SP.
          </p>
          <p>
            Encarregado de Dados (DPO):{" "}
            <a
              href="mailto:dpo@ipet.app"
              className="link-underline text-ink"
            >
              dpo@ipet.app
            </a>
          </p>
        </Section>

        <Section numero="02" titulo="Dados que coletamos">
          <List
            items={[
              "Dados cadastrais: nome, e-mail, telefone, data de nascimento.",
              "Dados de identificação: CPF armazenado apenas como hash SHA-256.",
              "Dados do pet: nome, espécie, raça, microchip, peso, vacinas, sorologia.",
              "Documentos: imagens de carteiras de vacinação e certificados de microchip que você optou por enviar.",
              "Dados técnicos: endereço IP (hash), user-agent, logs de acesso.",
            ]}
          />
        </Section>

        <Section numero="03" titulo="Finalidades do tratamento">
          <List
            items={[
              "Prover o serviço de orientação sanitária para viagens com pets.",
              "Gerar roadmaps personalizados de compliance por destino.",
              "Comunicar prazos críticos e atualizações regulatórias.",
              "Cumprir obrigações legais, regulatórias e fiscais.",
            ]}
          />
        </Section>

        <Section numero="04" titulo="Bases legais (LGPD Art. 7º)">
          <List
            items={[
              "Execução de contrato: uso da plataforma.",
              "Consentimento: envio de documentos e comunicações de marketing.",
              "Obrigação legal: guarda de logs (Marco Civil) por 6 meses.",
              "Legítimo interesse: prevenção a fraude e analytics agregados.",
            ]}
          />
        </Section>

        <Section numero="05" titulo="Compartilhamento">
          <p>
            O iPet não vende seus dados. Compartilhamos apenas com: provedores
            de infraestrutura (Supabase, Vercel), processador de pagamentos
            (Mercado Pago), e autoridades competentes mediante ordem judicial.
          </p>
        </Section>

        <Section numero="06" titulo="Armazenamento e retenção">
          <p>
            Dados ativos: enquanto sua conta existir. Após exclusão:
            anonimização em 30 dias, remoção definitiva em 90 dias (exceto
            dados sujeitos a guarda legal).
          </p>
        </Section>

        <Section numero="07" titulo="Seus direitos (LGPD Art. 18)">
          <List
            items={[
              "Confirmar a existência de tratamento.",
              "Acessar e corrigir seus dados.",
              "Solicitar portabilidade ou exclusão.",
              "Revogar consentimento a qualquer momento.",
              "Solicitar anonimização ou bloqueio de dados desnecessários.",
            ]}
          />
          <p className="mt-3">
            Para exercer:{" "}
            <a
              href="mailto:privacidade@ipet.app"
              className="link-underline text-ink"
            >
              privacidade@ipet.app
            </a>
          </p>
        </Section>

        <Section numero="08" titulo="Segurança">
          <p>
            Criptografia em trânsito (TLS 1.3) e em repouso (AES-256). Logs de
            acesso, controle de permissões por Row Level Security e auditoria
            de alterações em dados sensíveis.
          </p>
        </Section>

        <Section numero="09" titulo="Cookies">
          <p>
            Usamos apenas cookies essenciais para autenticação e funcionamento
            do serviço. Não utilizamos cookies de rastreamento de terceiros
            sem seu consentimento explícito.
          </p>
        </Section>

        <Section numero="10" titulo="Alterações">
          <p>
            Esta política pode ser atualizada. Mudanças relevantes serão
            comunicadas por e-mail e exigirão novo consentimento quando
            aplicável.
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-[auto_1fr] gap-6">
      <span className="font-mono text-[11px] text-faint tracking-widest pt-1.5">
        {numero}
      </span>
      <div>
        <h2 className="font-display text-[20px] text-ink leading-tight tracking-tight mb-3">
          {titulo}
        </h2>
        <div className="space-y-2.5 text-ink/70">{children}</div>
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed">
          <span className="font-mono text-faint shrink-0 text-[12px] pt-0.5">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
