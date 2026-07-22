import React, { useState } from "react";

const initialFormData = {
  nome: "",
  whatsapp: "",
  empresa: "",
  cidade: "",
  segmento: "",
  website: "",
  tipoDiagnostico: "recomendacao_ia"
};

export default function DiagnosticForm({ onSubmit, loading, onBack }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const campos = [
    {
      id: "nome",
      label: "Nome",
      placeholder: "Seu nome",
      type: "text",
      maxLength: 80
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      placeholder: "Seu WhatsApp",
      type: "tel",
      maxLength: 30
    },
    {
      id: "empresa",
      label: "Nome da empresa",
      placeholder: "Nome da sua empresa",
      type: "text",
      maxLength: 120
    },
    {
      id: "cidade",
      label: "Cidade",
      placeholder: "Exemplo: Lisboa",
      type: "text",
      maxLength: 80
    },
    {
      id: "segmento",
      label: "Nicho ou segmento",
      placeholder: "Exemplo: contabilidade",
      type: "text",
      maxLength: 100
    }
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Informe seu nome para personalizar o diagnóstico.";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Informe seu WhatsApp para receber o convite depois.";
    } else if (formData.whatsapp.replace(/\D/g, "").length < 8) {
      newErrors.whatsapp = "O WhatsApp precisa ter pelo menos 8 números.";
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "Informe o nome da empresa que será analisada.";
    } else if (formData.empresa.trim().length < 2) {
      newErrors.empresa = "O nome da empresa precisa ter pelo menos 2 caracteres.";
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = "Informe a cidade onde sua empresa atua.";
    }

    if (formData.website?.trim()) {
      newErrors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
    }

    if (!formData.segmento.trim()) {
      newErrors.segmento = "Informe o segmento da sua empresa.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit(formData);
  };

  return (
    <section id="diagnostico" className="px-4 pb-12 pt-6 md:px-6 md:pb-14 md:pt-8">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-primary">Recomendação por IA</p>
            <h2 className="mt-2 text-[22px] font-semibold leading-7 tracking-[-0.025em] text-dark md:text-[24px]">
              Vamos analisar o seu mercado
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">Preencha as informações abaixo para iniciar a análise.</p>
          </div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="shrink-0 rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-surface-hover hover:text-dark disabled:opacity-50"
            >
              Trocar diagnóstico
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-5 md:p-6" noValidate>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex="-1"
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {errors.formulario ? (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] font-medium leading-5 text-red-700">
              {errors.formulario}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {campos.map((campo) => (
              <label key={campo.id} className={campo.id === "empresa" ? "md:col-span-2" : ""}>
                <span className="mb-2 block text-[13px] font-medium text-dark">{campo.label}</span>
                <input
                  type={campo.type}
                  name={campo.id}
                  value={formData[campo.id]}
                  onChange={handleChange}
                  placeholder={campo.placeholder}
                  maxLength={campo.maxLength}
                  className={`focus-ring h-12 w-full rounded-xl border bg-white px-4 text-[14px] text-dark outline-none transition placeholder:text-gray-400 ${
                    errors[campo.id] ? "border-red-400" : "border-[#DADCE0] hover:border-gray-400"
                  }`}
                  disabled={loading}
                />
                {errors[campo.id] ? (
                  <span className="mt-2 block text-[12px] font-medium leading-5 text-red-600">
                    {errors[campo.id]}
                  </span>
                ) : null}
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-line pt-5">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1765CC] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Analisando concorrentes..." : "Iniciar análise"}
              {!loading ? <span className="ml-2" aria-hidden="true">→</span> : null}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
