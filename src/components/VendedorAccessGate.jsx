import React, { useState } from "react";

export default function VendedorAccessGate({ onLogin, checking = false, notice = "" }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valor = codigo.trim();

    if (!valor) {
      setError("Digite o código do vendedor para continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onLogin(valor);
      setCodigo("");
    } catch (err) {
      setError(err.message || "Código inválido. Confira e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 pb-16 pt-6 md:px-6 md:pb-20 md:pt-8">
      <div className="mx-auto max-w-[520px] rounded-2xl border border-line bg-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4285F4]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <rect x="5" y="10" width="14" height="10" rx="2.5" />
              <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-medium text-[#4285F4]">Acesso do vendedor</p>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.025em] text-dark">Digite seu código para continuar</h2>
            <p className="mt-2 text-[13px] leading-5 text-muted">
              O código libera os diagnósticos e mantém o histórico separado para cada vendedor.
            </p>
          </div>
        </div>


        {notice ? (
          <div className="mt-5 rounded-xl border border-[#F3D7A3] bg-[#FEF7E0] p-3.5 text-[12px] font-medium leading-5 text-[#8A4D00]">
            {notice}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <label>
            <span className="mb-2 block text-[13px] font-medium text-dark">Código do vendedor</span>
            <input
              type="password"
              value={codigo}
              onChange={(event) => {
                setCodigo(event.target.value);
                if (error) setError("");
              }}
              placeholder="Digite seu código"
              autoComplete="off"
              spellCheck="false"
              maxLength={80}
              disabled={loading || checking}
              className={`focus-ring h-12 w-full rounded-xl border bg-white px-4 text-[14px] text-dark outline-none transition placeholder:text-gray-400 ${
                error ? "border-red-400" : "border-[#DADCE0] hover:border-gray-400"
              }`}
            />
          </label>

          {error ? <p className="mt-2 text-[12px] font-medium leading-5 text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || checking}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#4285F4] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#3367D6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? "Validando sessão..." : loading ? "Validando código..." : "Acessar diagnósticos"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-4 text-gray-400">
          O código é validado no servidor e não é gravado no navegador nem incluído no código do front-end.
        </p>
      </div>
    </section>
  );
}
