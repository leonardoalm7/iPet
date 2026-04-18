"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-12 max-w-2xl mx-auto">
      <Link
        href="javascript:history.back()"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-navy mb-1">Termos de Uso</h1>
      <p className="text-gray-400 text-xs mb-8">Versão 1.0.0 — vigente desde 1º de abril de 2026</p>

      <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
        <Section titulo="1. Aceitação">
          <p>
            Ao criar uma conta no iPet, você concorda com estes Termos de Uso. Se não concordar
            com qualquer disposição, não utilize a plataforma.
          </p>
        </Section>

        <Section titulo="2. Descrição do Serviço">
          <p>
            O iPet é uma plataforma digital de gestão de saúde e compliance de viagem para pets.
            Oferece orientação sobre documentação, exames e prazos para viagens nacionais e
            internacionais com animais de estimação.
          </p>
          <p className="mt-2 text-yellow-300/80 text-xs bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-3">
            As informações de compliance fornecidas pelo iPet são de caráter orientativo. O
            responsável pelo pet deve sempre confirmar os requisitos oficiais junto às autoridades
            competentes (MAPA, VIGIAGRO, autoridades veterinárias do país de destino).
          </p>
        </Section>

        <Section titulo="3. Cadastro e Segurança">
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais. Notifique
            imediatamente o suporte em caso de acesso não autorizado à sua conta.
          </p>
        </Section>

        <Section titulo="4. Uso Permitido">
          <p>É proibido:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Usar a plataforma para fins fraudulentos ou ilegais</li>
            <li>Tentar acessar contas de outros usuários</li>
            <li>Inserir informações falsas sobre documentação veterinária</li>
            <li>Fazer engenharia reversa do sistema</li>
          </ul>
        </Section>

        <Section titulo="5. Propriedade Intelectual">
          <p>
            Todo o conteúdo, marcas, logotipos e software do iPet são propriedade exclusiva da
            iPet Tecnologia LTDA. É vedada a reprodução sem autorização prévia por escrito.
          </p>
        </Section>

        <Section titulo="6. Limitação de Responsabilidade">
          <p>
            O iPet não se responsabiliza por decisões tomadas com base nas informações fornecidas
            pela plataforma, especialmente no que diz respeito a requisitos de entrada de animais
            em outros países, que podem mudar sem aviso prévio.
          </p>
        </Section>

        <Section titulo="7. Privacidade e LGPD">
          <p>
            O tratamento de dados pessoais é regido pela nossa{" "}
            <Link href="/lgpd/privacidade" className="text-teal underline">
              Política de Privacidade
            </Link>
            , em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </Section>

        <Section titulo="8. Rescisão">
          <p>
            Você pode encerrar sua conta a qualquer momento pelo menu Perfil {">"} Configurações.
            O iPet pode suspender contas que violem estes Termos.
          </p>
        </Section>

        <Section titulo="9. Alterações">
          <p>
            Reservamo-nos o direito de atualizar estes Termos. Mudanças significativas serão
            comunicadas por e-mail com antecedência mínima de 30 dias.
          </p>
        </Section>

        <Section titulo="10. Foro">
          <p>
            Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer conflitos
            decorrentes destes Termos, com renúncia a qualquer outro por mais privilegiado que seja.
          </p>
        </Section>

        <Section titulo="11. Contato">
          <p>
            Para dúvidas sobre estes Termos, entre em contato:
            <br />
            <span className="text-teal">legal@ipet.app</span>
            <br />
            iPet Tecnologia LTDA — São Paulo, SP
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-navy font-semibold mb-2">{titulo}</h2>
      {children}
    </div>
  );
}
