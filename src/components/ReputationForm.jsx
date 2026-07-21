import React, { useState } from "react";

const initialFormData = {
  nome: "",
  whatsapp: "",
  empresa: "",
  cidade: "",
  perfilGoogle: "",
  siteEmpresa: "",
  website: "",
  tipoDiagnostico: "reputacao"
};

function urlNormalizavel(value = "") {
  const texto = value.trim();
  if (!texto) return false;

  try {
    const url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
  }
}

export default function ReputationForm({ onSubmit, loading, onBack }) {
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
      maxLength: 120,
      full: true
    },
    {
      id: "cidade",
      label: "Cidade",
      placeholder: "Exemplo: São Paulo",
      type: "text",
      maxLength: 80
    },
    {
      id: "perfilGoogle",
      label: "Link do Perfil da Empresa no Google",
      placeholder: "Exemplo: maps.app.goo.gl/...",
      type: "text",
      maxLength: 500,
      full: true
    },
    {
      id: "siteEmpresa",
      label: "Site da empresa",
      placeholder: "Exemplo: suaempresa.com.br",
      type: "text",
      maxLength: 500,
      full: true
    }
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Informe seu nome.";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Informe seu WhatsApp.";
    } else if (formData.whatsapp.replace(/\D/g, "").length < 8) {
      newErrors.whatsapp = "O WhatsApp precisa ter pelo menos 8 números.";
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = "Informe o nome da empresa que será analisada.";
    } else if (formData.empresa.trim().length < 2) {
      newErrors.empresa = "O nome da empresa precisa ter pelo menos 2 caracteres.";
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = "Informe a cidade da empresa.";
    }

    if (!formData.perfilGoogle.trim()) {
      newErrors.perfilGoogle = "Informe o link do Perfil da Empresa no Google.";
    } else if (!urlNormalizavel(formData.perfilGoogle)) {
      newErrors.perfilGoogle = "Informe um link válido do Perfil da Empresa no Google.";
    }

    if (!formData.siteEmpresa.trim()) {
      newErrors.siteEmpresa = "Informe o site da empresa.";
    } else if (!urlNormalizavel(formData.siteEmpresa)) {
      newErrors.siteEmpresa = "Informe um endereço de site válido.";
    }

    if (formData.website?.trim()) {
      newErrors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
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
    <section id="diagnostico" className="px-6 py-10 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-5 shadow-card md:p-8 lg:p-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
              Reputação e autoridade digital
            </p>
            <h2 className="mt-2 text-2xl font-black text-dark md:text-3xl">
              Vamos analisar a sua própria empresa
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Use os links reais da empresa para reduzir ambiguidades e tornar a análise mais confiável.
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            Trocar diagnóstico
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errors.formulario}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {campos.map((campo) => (
              <label key={campo.id} className={campo.full ? "md:col-span-2" : ""}>
                <span className="mb-2 block text-sm font-bold text-dark">{campo.label}</span>
                <input
                  type={campo.type}
                  name={campo.id}
                  value={formData[campo.id]}
                  onChange={handleChange}
                  placeholder={campo.placeholder}
                  maxLength={campo.maxLength}
                  className={`focus-ring w-full rounded-2xl border bg-white px-4 py-4 text-dark shadow-sm transition ${
                    errors[campo.id] ? "border-red-400" : "border-gray-200"
                  }`}
                  disabled={loading}
                />
                {errors[campo.id] ? (
                  <span className="mt-2 block text-sm font-medium text-red-600">
                    {errors[campo.id]}
                  </span>
                ) : null}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Analisando reputação..." : "Analisar reputação da empresa"}
          </button>
        </form>
      </div>
    </section>
  );
}
