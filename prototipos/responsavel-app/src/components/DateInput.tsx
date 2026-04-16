"use client";

/**
 * Input com máscara automática DD/MM/AAAA.
 * Insere "/" automaticamente nas posições 2 e 5.
 * Aceita apenas dígitos — remove qualquer outro caractere.
 */

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

function applyMask(raw: string): string {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateInput({ label, value, onChange, placeholder = "DD/MM/AAAA", className }: Props) {
  function handleChange(raw: string) {
    // Se o usuário apagou um "/" deixa apagar normalmente
    const masked = applyMask(raw);
    onChange(masked);
  }

  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        maxLength={10}
        className={
          className ??
          "w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        }
      />
    </div>
  );
}
