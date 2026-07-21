import Link from "next/link";

export default function VerificarEmailPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <span className="text-5xl">📧</span>
      <h1 className="text-2xl font-bold text-navy mt-4">Verifique seu e-mail</h1>
      <p className="text-navy/60 text-sm mt-2">
        Enviamos um link de confirmação. Clique nele para ativar sua conta.
      </p>
      <Link href="/auth/entrar"
        className="mt-6 inline-block text-sm text-teal font-medium hover:underline">
        Voltar ao login
      </Link>
    </div>
  );
}
