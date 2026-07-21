import React, { useState } from "react";

const initialFormData = {
  nome: "",
  whatsapp: "",
  empresa: "",
  cidade: "",
  segmento: "",
  website: ""
};

export default function DiagnosticForm({ onSubmit, loading }) {
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
    <section id="diagnostico" className="px-6 py-10 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-5 shadow-card md:p-8 lg:p-10">
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
              <label key={campo.id} className={campo.id === "empresa" ? "md:col-span-2" : ""}>
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
            {loading ? "Analisando concorrentes..." : "Descobrir meus concorrentes recomendados pela IA"}
          </button>
        </form>
      </div>
    </section>
  );
}
