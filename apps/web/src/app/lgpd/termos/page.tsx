import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Termos de Uso — iPet" };

export default function TermosPage() {
  return (
    <article className="text-ink/75 leading-relaxed text-[14px]">
      <p className="kicker text-terracotta">Documento legal</p>
      <h1 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none font-light tracking-tight text-ink mt-3">
        Termos de uso
      </h1>
      <p className="text-[11px] font-mono text-muted mt-3 tracking-wider">
        v1.0.0 · vigente desde 1 de abril de 2026
      </p>

      <div className="editorial-rule my-10" />

      <div className="space-y-10">
        <Section numero="01" titulo="Aceitação">
          <p>
            Ao criar uma conta no iPet, você concorda com estes Termos de Uso.
            Se não concordar com qualquer disposição, não utilize a plataforma.
          </p>
        </Section>

        <Section numero="02" titulo="Descrição do serviço">
          <p>
            O iPet é uma plataforma digital de gestão de saúde e compliance de
            viagem para pets. Oferece orientação sobre documentação, exames e
            prazos para viagens nacionais e internacionais com animais de
            estimação.
          </p>
          <div className="mt-4 flex items-start gap-2.5 bg-terracotta-soft/40 border border-terracotta-soft rounded-2xl px-4 py-3.5 text-[12px] text-terracotta-deep">
            <AlertTriangle
              size={13}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
            />
            <p className="leading-relaxed">
              As informações de compliance fornecidas pelo iPet são de caráter
              orientativo. O responsável pelo pet deve sempre confirmar os
              requisitos oficiais junto às autoridades competentes (MAPA,
              VIGIAGRO, autoridades veterinárias do país de destino).
            </p>
          </div>
        </Section>

        <Section numero="03" titulo="Cadastro e segurança">
          <p>
            Você é responsável por manter a confidencialidade de suas
            credenciais. Notifique imediatamente o suporte em caso de acesso
            não autorizado à sua conta.
          </p>
        </Section>

        <Section numero="04" titulo="Uso permitido">
          <p>É proibido:</p>
          <ul className="space-y-1.5 mt-2">
            {[
              "Usar a plataforma para fins fraudulentos ou ilegais.",
              "Tentar acessar contas de outros usuários.",
              "Inserir informações falsas sobre documentação veterinária.",
              "Fazer engenharia reversa do sistema.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed">
                <span className="font-mono text-faint shrink-0 text-[12px] pt-0.5">
                  —
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section numero="05" titulo="Propriedade intelectual">
          <p>
            Todo o conteúdo, marcas, logotipos e software do iPet são
            propriedade exclusiva da iPet Tecnologia LTDA. É vedada a
            reprodução sem autorização prévia por escrito.
          </p>
        </Section>

        <Section numero="06" titulo="Limitação de responsabilidade">
          <p>
            O iPet não se responsabiliza por decisões tomadas com base nas
            informações fornecidas pela plataforma, especialmente no que diz
            respeito a requisitos de entrada de animais em outros países, que
            podem mudar sem aviso prévio.
          </p>
        </Section>

        <Section numero="07" titulo="Privacidade e LGPD">
          <p>
            O tratamento de dados pessoais é regido pela nossa{" "}
            <Link
              href="/lgpd/privacidade"
              className="link-underline text-ink"
            >
              Política de Privacidade
            </Link>
            , em conformidade com a Lei Geral de Proteção de Dados (Lei nº
            13.709/2018).
          </p>
        </Section>

        <Section numero="08" titulo="Rescisão">
          <p>
            Você pode encerrar sua conta a qualquer momento pelo menu Perfil
            &gt; Configurações. O iPet pode suspender contas que violem estes
            Termos.
          </p>
        </Section>

        <Section numero="09" titulo="Alterações">
          <p>
            Reservamo-nos o direito de atualizar estes Termos. Mudanças
            significativas serão comunicadas por e-mail com antecedência
            mínima de 30 dias.
          </p>
        </Section>

        <Section numero="10" titulo="Foro">
          <p>
            Fica eleito o foro da Comarca de São Paulo/SP para dirimir
            quaisquer conflitos decorrentes destes Termos, com renúncia a
            qualquer outro por mais privilegiado que seja.
          </p>
        </Section>

        <Section numero="11" titulo="Contato">
          <p>
            Para dúvidas sobre estes Termos, entre em contato:{" "}
            <a href="mailto:legal@ipet.app" className="link-underline text-ink">
              legal@ipet.app
            </a>
          </p>
          <p className="text-muted mt-1">
            iPet Tecnologia LTDA — São Paulo, SP
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
