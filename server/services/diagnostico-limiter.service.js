import crypto from "node:crypto";

const DEFAULT_BLOCK_DAYS = 30;

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

function gerarHash(valor = "") {
  return crypto.createHash("sha256").update(valor).digest("hex");
}

export function obterIpRequisicao(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "ip-nao-identificado";
}

export function obterClientId(req) {
  const clientId = req.headers["x-client-id"];

  if (typeof clientId !== "string") return "";
  return clientId.trim().slice(0, 120);
}

export function obterBlockDays() {
  const valor = Number(process.env.DIAGNOSTICO_DUPLICATE_BLOCK_DAYS);

  if (Number.isFinite(valor) && valor >= 0) {
    return valor;
  }

  return DEFAULT_BLOCK_DAYS;
}

export function criarChavesLimiter(data, clientId = "") {
  const whatsapp = normalizarWhatsapp(data.whatsapp);
  const empresa = normalizarTexto(data.empresa);
  const cidade = normalizarTexto(data.cidade);
  const segmento = normalizarTexto(data.segmento);
  const client = normalizarTexto(clientId);

  const basePedido = `${whatsapp}|${empresa}|${cidade}|${segmento}`;
  const baseBrowser = client ? `${client}|${empresa}|${cidade}|${segmento}` : "";

  return {
    limiterKey: gerarHash(basePedido),
    browserLimiterKey: baseBrowser ? gerarHash(baseBrowser) : "",
    dadosNormalizados: {
      whatsapp,
      empresa,
      cidade,
      segmento
    }
  };
}

function estaDentroDoPrazo(dataEnvio, blockDays) {
  if (blockDays === 0) return true;

  const enviadoEm = new Date(dataEnvio).getTime();

  if (!Number.isFinite(enviadoEm)) return false;

  const limiteMs = blockDays * 24 * 60 * 60 * 1000;
  return Date.now() - enviadoEm <= limiteMs;
}

export function encontrarDiagnosticoDuplicado(leads = [], chaves, blockDays) {
  return leads.find((lead) => {
    if (!estaDentroDoPrazo(lead.dataEnvio, blockDays)) {
      return false;
    }

    const mesmaChaveDoPedido = lead.limiterKey && lead.limiterKey === chaves.limiterKey;
    const mesmaChaveDoNavegador =
      chaves.browserLimiterKey && lead.browserLimiterKey && lead.browserLimiterKey === chaves.browserLimiterKey;

    return mesmaChaveDoPedido || mesmaChaveDoNavegador;
  });
}

export function montarRespostaBloqueio(lead, blockDays) {
  const prazoTexto = blockDays === 0 ? "já foi registrado" : `já foi registrado nos últimos ${blockDays} dias`;

  return {
    code: "DIAGNOSTICO_JA_SOLICITADO",
    bloqueado: true,
    message:
      `Este diagnóstico ${prazoTexto}. Para evitar uso repetido da análise com IA, não vamos gerar uma nova consulta agora. ` +
      "Nossa equipe pode continuar pelo WhatsApp com base na solicitação já enviada.",
    leadAnterior: {
      empresa: lead.empresa,
      cidade: lead.cidade,
      segmento: lead.segmento,
      dataEnvio: lead.dataEnvio,
      diagnosticoStatus: lead.diagnosticoStatus
    }
  };
}
