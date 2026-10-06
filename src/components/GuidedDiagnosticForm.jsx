import React, { useEffect, useMemo, useState } from "react";
import { montarPayloadDiagnostico } from "../utils/payload.js";

const baseData = {
  nome: "",
  empresa: "",
  cidade: "",
  segmento: "",
  principalProduto: "",
  perfilGoogle: "",
  siteEmpresa: "",
  website: ""
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

const configs = {
  recomendacao_ia: {
    eyebrow: "Diagnóstico de autoridade",
    title: "Vamos entender o espaço que sua empresa ocupa.",
    steps: [
      {
        label: "IDENTIFICANDO",
        title: "Qual empresa vamos analisar?",
        description: "Comece pelo essencial. Depois a gente entra no contexto de mercado.",
        fields: [
          { id: "nome", label: "Seu nome", placeholder: "Como podemos te chamar?", maxLength: 80 },
          { id: "empresa", label: "Nome da empresa", placeholder: "Ex.: Casa do Ads", maxLength: 120 }
        ]
      },
      {
        label: "CONTEXTO",
        title: "Onde essa empresa disputa atenção?",
        description: "Esses dados ajudam a análise a comparar sua empresa com o contexto certo.",
        fields: [
          { id: "cidade", label: "Cidade", placeholder: "Ex.: Santos", maxLength: 80 },
          { id: "segmento", label: "Nicho ou segmento", placeholder: "Ex.: marketing digital", maxLength: 100 },
          { id: "principalProduto", label: "Principal produto ou serviço", placeholder: "Ex.: Gestão de Google Ads", maxLength: 160, full: true }
        ]
      },
      {
        label: "PRONTO",
        title: "Tudo certo para começar a leitura.",
        description: "Confira o contexto. A próxima tela já é a análise em andamento.",
        summary: true
      }
    ]
  },
  reputacao: {
    eyebrow: "Reputação e autoridade digital",
    title: "Vamos montar o raio-X da sua presença.",
    steps: [
      {
        label: "IDENTIFICANDO",
        title: "Qual empresa vamos analisar?",
        description: "Primeiro, precisamos identificar exatamente a marca certa.",
        fields: [
          { id: "nome", label: "Seu nome", placeholder: "Como podemos te chamar?", maxLength: 80 },
          { id: "empresa", label: "Nome da empresa", placeholder: "Nome exato da empresa", maxLength: 120 }
        ]
      },
      {
        label: "PRESENÇA",
        title: "Onde sua empresa existe na internet?",
        description: "Use os links reais. Isso reduz ambiguidade e fortalece a leitura.",
        fields: [
          { id: "siteEmpresa", label: "Site da empresa", placeholder: "suaempresa.com.br", maxLength: 500, kind: "url", badge: "site" },
          { id: "perfilGoogle", label: "Perfil da Empresa no Google", placeholder: "maps.app.goo.gl/...", maxLength: 500, kind: "url", badge: "google" }
        ]
      },
      {
        label: "CONTEXTO",
        title: "Agora só falta contextualizar.",
        description: "Cidade e oferta principal ajudam a interpretar a reputação no mercado correto.",
        fields: [
          { id: "cidade", label: "Cidade", placeholder: "Ex.: Santos", maxLength: 80 },
          { id: "principalProduto", label: "Principal produto ou serviço", placeholder: "Ex.: Implantes dentários", maxLength: 160 }
        ]
      },
      {
        label: "PRONTO",
        title: "Sua empresa está pronta para entrar na leitura.",
        description: "Confira os dados abaixo antes de iniciar.",
        summary: true
      }
    ]
  }
};

function fieldError(id, value) {
  const clean = String(value || "").trim();
  if (!clean) {
    const labels = {
      nome: "Informe seu nome.",
      empresa: "Informe o nome da empresa.",
      cidade: "Informe a cidade da empresa.",
      segmento: "Informe o nicho ou segmento.",
      principalProduto: "Informe o principal produto ou serviço.",
      siteEmpresa: "Informe o site da empresa.",
      perfilGoogle: "Informe o Perfil da Empresa no Google."
    };
    return labels[id] || "Preencha este campo.";
  }
  if (id === "empresa" && clean.length < 2) return "O nome da empresa precisa ter pelo menos 2 caracteres.";
  if (["siteEmpresa", "perfilGoogle"].includes(id) && !urlNormalizavel(clean)) return "Informe um endereço válido.";
  return "";
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" aria-hidden="true">
      <path d="m5 12 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function JourneyProgress({ steps, active }) {
  return (
    <div className="journey-progress" aria-label={`Etapa ${active + 1} de ${steps.length}`}>
      <div className="journey-progress-line" aria-hidden="true">
        <span style={{ width: `${steps.length <= 1 ? 100 : (active / (steps.length - 1)) * 100}%` }} />
      </div>
      <div className="journey-progress-labels">
        {steps.map((item, index) => (
          <div key={item.label} className={`journey-progress-item ${index < active ? "is-done" : ""} ${index === active ? "is-active" : ""}`}>
            <span className="journey-progress-dot">{index < active ? <CheckIcon /> : null}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary({ data, tipo }) {
  const rows = tipo === "reputacao"
    ? [
        ["Empresa", data.empresa],
        ["Cidade", data.cidade],
        ["Oferta principal", data.principalProduto],
        ["Site", data.siteEmpresa],
        ["Perfil Google", data.perfilGoogle]
      ]
    : [
        ["Empresa", data.empresa],
        ["Cidade", data.cidade],
        ["Nicho", data.segmento],
        ["Oferta principal", data.principalProduto]
      ];

  return (
    <div className="journey-summary analysis-object-morph" style={{ viewTransitionName: "analysis-object" }}>
      <div className="journey-company-mark" aria-hidden="true">{(data.empresa || "E").trim().slice(0, 1).toUpperCase()}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.11em] text-gray-400">Objeto da análise</p>
        <h3 className="mt-1 truncate text-[22px] font-semibold tracking-[-0.035em] text-dark">{data.empresa}</h3>
        <div className="mt-5 grid gap-x-7 gap-y-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0 border-t border-line/80 pt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">{label}</p>
              <p className="mt-1 truncate text-[13px] font-medium text-gray-700" title={value}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuidedDiagnosticForm({ tipo, onSubmit, loading, onBack, initialData, onDraftChange }) {
  const config = configs[tipo] || configs.recomendacao_ia;
  const [formData, setFormData] = useState(() => ({ ...baseData, ...(initialData || {}), tipoDiagnostico: tipo }));
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");
  const current = config.steps[step];

  useEffect(() => {
    onDraftChange?.(formData);
  }, [formData, onDraftChange]);

  const recognized = useMemo(() => ({
    siteEmpresa: Boolean(formData.siteEmpresa.trim() && urlNormalizavel(formData.siteEmpresa)),
    perfilGoogle: Boolean(formData.perfilGoogle.trim() && urlNormalizavel(formData.perfilGoogle))
  }), [formData.siteEmpresa, formData.perfilGoogle]);

  const validateCurrent = () => {
    const nextErrors = {};
    (current.fields || []).forEach((field) => {
      const message = fieldError(field.id, formData[field.id]);
      if (message) nextErrors[field.id] = message;
    });
    if (formData.website?.trim()) nextErrors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const change = (event) => {
    const { name, value } = event.target;
    setFormData((old) => ({ ...old, [name]: value }));
    if (errors[name]) setErrors((old) => ({ ...old, [name]: "" }));
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    setDirection("forward");
    setStep((value) => Math.min(value + 1, config.steps.length - 1));
  };

  const goBack = () => {
    if (step === 0) {
      onBack?.();
      return;
    }
    setErrors({});
    setDirection("back");
    setStep((value) => Math.max(0, value - 1));
  };

  const submit = (event) => {
    event.preventDefault();
    if (current.summary) {
      onSubmit(montarPayloadDiagnostico(formData, tipo));
      return;
    }
    goNext();
  };

  return (
    <section id="diagnostico" className="journey-section px-4 pb-14 pt-4 md:px-6 md:pb-20 md:pt-6">
      <div className="mx-auto max-w-[780px]">
        <JourneyProgress steps={config.steps} active={step} />

        <div className="mt-7 md:mt-10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">{config.eyebrow}</p>
              <p className="mt-2 text-[13px] text-gray-400">Etapa {step + 1} de {config.steps.length}</p>
            </div>
            <button type="button" onClick={goBack} disabled={loading} className="journey-ghost-button">
              {step === 0 ? "Trocar diagnóstico" : "Voltar"}
            </button>
          </div>

          <form onSubmit={submit} noValidate className="journey-form-card" style={{ viewTransitionName: "diagnostic-stage" }}>
            <input type="text" name="website" value={formData.website} onChange={change} tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />

            <div key={`${step}-${direction}`} className={`journey-step journey-step-${direction}`}>
              <div className="max-w-[640px]">
                <h2 className="text-[28px] font-semibold leading-[1.12] tracking-[-0.045em] text-dark md:text-[36px]">{current.title}</h2>
                <p className="mt-3 text-[14px] leading-6 text-muted md:text-[15px]">{current.description}</p>
              </div>

              {errors.formulario ? <div className="journey-error mt-5">{errors.formulario}</div> : null}

              {current.summary ? (
                <div className="mt-7"><Summary data={formData} tipo={tipo} /></div>
              ) : (
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {current.fields.map((field) => (
                    <label key={field.id} className={field.full ? "md:col-span-2" : ""}>
                      <span className="mb-2 flex items-center justify-between gap-3 text-[12px] font-semibold text-gray-700">
                        <span>{field.label}</span>
                        {field.badge && recognized[field.id] ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2 py-1 text-[10px] font-semibold text-[#137333] journey-recognized">
                            <CheckIcon /> link identificado
                          </span>
                        ) : null}
                      </span>
                      <input
                        name={field.id}
                        value={formData[field.id]}
                        onChange={change}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        disabled={loading}
                        autoFocus={field === current.fields[0]}
                        className={`journey-input ${errors[field.id] ? "is-error" : ""}`}
                      />
                      {errors[field.id] ? <span className="mt-2 block text-[11px] font-medium text-red-600 journey-error-text">{errors[field.id]}</span> : null}
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-5 text-gray-400">
                  {current.summary ? "A análise usa os mesmos dados em qualquer formato de entrega." : "Preencha só o necessário. O restante acontece na leitura."}
                </p>
                <button type="submit" disabled={loading} className="journey-primary-button">
                  {loading ? "Iniciando..." : current.summary ? "Iniciar leitura" : "Continuar"}
                  {!loading ? <span aria-hidden="true">→</span> : null}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
