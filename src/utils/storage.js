const STORAGE_KEY = "leadsDiagnosticoIA";
const REQUESTS_KEY = "diagnosticosSolicitadosIA";
const CLIENT_ID_KEY = "diagnosticoIAClientId";

function normalizarTexto(texto = "") {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizarWhatsapp(whatsapp = "") {
  return whatsapp.toString().replace(/\D/g, "");
}

function gerarIdLocal() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function obterClientId() {
  try {
    const existente = localStorage.getItem(CLIENT_ID_KEY);

    if (existente) return existente;

    const novoClientId = gerarIdLocal();
    localStorage.setItem(CLIENT_ID_KEY, novoClientId);
    return novoClientId;
  } catch (error) {
    console.error("Erro ao gerar clientId local", error);
    return "";
  }
}

export function criarChaveDiagnostico(formData) {
  const tipoDiagnostico = formData.tipoDiagnostico === "reputacao" ? "reputacao" : "recomendacao_ia";
  const whatsapp = normalizarWhatsapp(formData.whatsapp);
  const empresa = normalizarTexto(formData.empresa);
  const cidade = normalizarTexto(formData.cidade);
  const segmento = normalizarTexto(formData.segmento || "");

  const complemento = tipoDiagnostico === "recomendacao_ia" ? `|${segmento}` : "";
  return `${tipoDiagnostico}|${whatsapp}|${empresa}|${cidade}${complemento}`;
}

function criarChaveLegada(formData) {
  const whatsapp = normalizarWhatsapp(formData.whatsapp);
  const empresa = normalizarTexto(formData.empresa);
  const cidade = normalizarTexto(formData.cidade);
  const segmento = normalizarTexto(formData.segmento || "");

  return `${whatsapp}|${empresa}|${cidade}|${segmento}`;
}

export function obterLeadsSalvos() {
  try {
    const leads = localStorage.getItem(STORAGE_KEY);
    return leads ? JSON.parse(leads) : [];
  } catch (error) {
    console.error("Erro ao ler leads do localStorage", error);
    return [];
  }
}

export function salvarLeadNoLocalStorage(lead) {
  try {
    const leadsAtuais = obterLeadsSalvos();
    const leadsAtualizados = [lead, ...leadsAtuais];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsAtualizados));
    return leadsAtualizados;
  } catch (error) {
    console.error("Erro ao salvar lead no localStorage", error);
    return [];
  }
}

export function obterDiagnosticosSolicitados() {
  try {
    const registros = localStorage.getItem(REQUESTS_KEY);
    return registros ? JSON.parse(registros) : {};
  } catch (error) {
    console.error("Erro ao ler diagnósticos solicitados", error);
    return {};
  }
}

export function verificarBloqueioLocal(formData) {
  const chave = criarChaveDiagnostico(formData);
  const registros = obterDiagnosticosSolicitados();
  let registro = registros[chave];

  // Compatibilidade com bloqueios gravados pelo diagnóstico antigo antes da criação de tipoDiagnostico.
  if (!registro && formData.tipoDiagnostico !== "reputacao") {
    registro = registros[criarChaveLegada(formData)];
  }

  if (!registro) {
    return {
      bloqueado: false,
      chave
    };
  }

  return {
    bloqueado: true,
    chave,
    registro,
    message:
      "Este diagnóstico já foi solicitado neste navegador. Para evitar consultas repetidas com IA, não vamos gerar uma nova análise agora. Nossa equipe pode continuar pelo WhatsApp com base na solicitação já enviada."
  };
}

export function marcarDiagnosticoSolicitadoLocal(formData, lead) {
  try {
    const chave = criarChaveDiagnostico(formData);
    const registros = obterDiagnosticosSolicitados();

    registros[chave] = {
      dataEnvio: lead.dataEnvio,
      empresa: lead.empresa,
      cidade: lead.cidade,
      segmento: lead.segmento || "",
      whatsapp: lead.whatsapp,
      tipoDiagnostico: lead.tipoDiagnostico || formData.tipoDiagnostico || "recomendacao_ia",
      diagnosticoStatus: lead.diagnosticoStatus
    };

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(registros));
    return registros[chave];
  } catch (error) {
    console.error("Erro ao marcar diagnóstico como solicitado", error);
    return null;
  }
}

export function enviarLeadParaWebhook(lead) {
  // Reservado para evolução futura no front-end.
  // Em produção, o envio real deve ficar no backend para proteger tokens e webhooks.
  return lead;
}
