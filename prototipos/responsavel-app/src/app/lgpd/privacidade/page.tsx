"use client";

import { ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen flex flex-col px-5 pt-12 pb-12 max-w-2xl mx-auto">
      <Link
        href="javascript:history.back()"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <Shield className="w-6 h-6 text-teal" />
        <h1 className="text-2xl font-bold text-navy">Política de Privacidade</h1>
      </div>
      <p className="text-gray-400 text-xs mb-2">Versão 1.0.0 — vigente desde 1º de abril de 2026</p>
      <p className="text-gray-500 text-xs mb-8">
        Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
      </p>

      <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
        <Section titulo="1. Controlador dos Dados">
          <p>
            <strong className="text-navy">iPet Tecnologia LTDA</strong>
            <br />
            São Paulo, SP — Brasil
            <br />
            E-mail DPO: <span className="text-teal">privacidade@ipet.app</span>
          </p>
        </Section>

        <Section titulo="2. Dados que Coletamos">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-border">
                <th className="text-left py-2 pr-4">Dado</th>
                <th className="text-left py-2 pr-4">Finalidade</th>
                <th className="text-left py-2">Base Legal (LGPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <DataRow dado="Nome completo" finalidade="Personalização e suporte" base="Art. 7º, V" />
              <DataRow dado="E-mail" finalidade="Autenticação e comunicações" base="Art. 7º, V" />
              <DataRow dado="Telefone" finalidade="Suporte e notificações" base="Art. 7º, V" />
              <DataRow dado="Data de nascimento" finalidade="Verificação de maioridade" base="Art. 7º, V" />
              <DataRow dado="CPF (hash SHA-256)" finalidade="Verificação de identidade" base="Art. 7º, V" />
              <DataRow dado="Foto de perfil" finalidade="Identificação visual" base="Art. 7º, I (consentimento)" />
              <DataRow dado="Dados do pet" finalidade="Funcionalidade principal" base="Art. 7º, V" />
              <DataRow dado="Logs de acesso" finalidade="Segurança e auditoria" base="Art. 7º, II" />
            </tbody>
          </table>
        </Section>

        <Section titulo="3. Dados que NÃO Coletamos">
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>CPF em texto simples (armazenamos apenas o hash SHA-256 irreversível)</li>
            <li>Dados de pagamento (processados diretamente pelo Mercado Pago)</li>
            <li>Localização em tempo real</li>
            <li>Biometria</li>
          </ul>
        </Section>

        <Section titulo="4. Como Armazenamos Seus Dados">
          <p>
            Seus dados são armazenados em servidores seguros na região{" "}
            <strong className="text-navy">sa-east-1 (São Paulo, Brasil)</strong> via Supabase /
            AWS, garantindo que os dados de cidadãos brasileiros permaneçam em território nacional
            conforme o Art. 33 da LGPD.
          </p>
          <p className="mt-2">
            Todas as comunicações utilizam criptografia TLS 1.3. Dados em repouso são criptografados
            com AES-256.
          </p>
        </Section>

        <Section titulo="5. Compartilhamento de Dados">
          <p>Compartilhamos dados apenas com:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong className="text-navy">Supabase (operador)</strong> — infraestrutura de banco
              de dados e autenticação
            </li>
            <li>
              <strong className="text-navy">Google / Apple (operador)</strong> — autenticação OAuth
              (somente e-mail e nome)
            </li>
            <li>
              <strong className="text-navy">Firebase (operador)</strong> — envio de notificações
              push
            </li>
            <li>
              <strong className="text-navy">Mercado Pago (operador)</strong> — processamento de
              pagamentos
            </li>
          </ul>
          <p className="mt-2">
            Nunca vendemos seus dados a terceiros.
          </p>
        </Section>

        <Section titulo="6. Seus Direitos (Art. 18 LGPD)">
          <p className="mb-3">
            Você pode exercer todos os seus direitos pelo menu{" "}
            <Link href="/perfil" className="text-teal underline">
              Perfil {">"} Privacidade e Dados
            </Link>{" "}
            ou por e-mail para <span className="text-teal">privacidade@ipet.app</span>. Respondemos
            em até <strong className="text-navy">15 dias</strong> (Art. 18 §3º LGPD).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmação da existência de tratamento (I)</li>
            <li>Acesso e exportação dos seus dados (II + V)</li>
            <li>Correção de dados incompletos ou inexatos (III)</li>
            <li>Eliminação dos dados (VI)</li>
            <li>Revogação do consentimento a qualquer momento (IX)</li>
          </ul>
        </Section>

        <Section titulo="7. Retenção de Dados">
          <p>
            Dados pessoais são mantidos enquanto a conta estiver ativa. Após a exclusão da conta,
            mantemos registros de consentimentos e auditoria pelo período de{" "}
            <strong className="text-navy">5 anos</strong> para fins de obrigação legal
            (Art. 16, I LGPD).
          </p>
        </Section>

        <Section titulo="8. Cookies">
          <p>
            Utilizamos apenas cookies essenciais para manter sua sessão autenticada. Não utilizamos
            cookies de rastreamento ou publicidade comportamental.
          </p>
        </Section>

        <Section titulo="9. Alterações">
          <p>
            Notificaremos mudanças significativas nesta política por e-mail com antecedência de
            30 dias. A versão atual estará sempre disponível nesta página.
          </p>
        </Section>

        <Section titulo="10. Contato com o DPO">
          <p>
            Encarregado de Proteção de Dados (DPO)
            <br />
            <span className="text-teal">privacidade@ipet.app</span>
            <br />
            Resposta em até 15 dias úteis.
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

function DataRow({
  dado,
  finalidade,
  base,
}: {
  dado: string;
  finalidade: string;
  base: string;
}) {
  return (
    <tr>
      <td className="py-2 pr-4 text-gray-400">{dado}</td>
      <td className="py-2 pr-4 text-gray-400">{finalidade}</td>
      <td className="py-2 text-teal">{base}</td>
    </tr>
  );
}
