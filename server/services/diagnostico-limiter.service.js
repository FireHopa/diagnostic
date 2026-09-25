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

export function permitirDiagnosticosRepetidos() {
  const valor = (process.env.DIAGNOSTICO_ALLOW_REPEAT || "").toString().trim().toLowerCase();
  return ["true", "1", "yes", "on", "sim"].includes(valor);
}

export function obterBlockDays() {
  const valor = Number(process.env.DIAGNOSTICO_DUPLICATE_BLOCK_DAYS);

  if (Number.isFinite(valor) && valor >= 0) {
    return valor;
  }

  return DEFAULT_BLOCK_DAYS;
}

export function criarChavesLimiter(data, clientId = "") {
  const tipoDiagnostico = data.tipoDiagnostico === "reputacao" ? "reputacao" : "recomendacao_ia";
  const empresa = normalizarTexto(data.empresa);
  const cidade = normalizarTexto(data.cidade);
  const segmento = normalizarTexto(data.segmento || "");
  const principalProduto = normalizarTexto(data.principalProduto || "");
  const client = normalizarTexto(clientId);

  const complemento = tipoDiagnostico === "recomendacao_ia" ? `|${segmento}` : "";
  const basePedido = `${tipoDiagnostico}|${empresa}|${cidade}${complemento}|${principalProduto}`;
  const baseBrowser = client ? `${tipoDiagnostico}|${client}|${empresa}|${cidade}${complemento}|${principalProduto}` : "";

  // Compatibilidade com a chave de navegador antiga, que não dependia do WhatsApp.
  const baseBrowserLegado = client ? `${client}|${empresa}|${cidade}|${segmento}` : "";

  return {
    limiterKey: gerarHash(basePedido),
    browserLimiterKey: baseBrowser ? gerarHash(baseBrowser) : "",
    legacyLimiterKey: "",
    legacyBrowserLimiterKey:
      tipoDiagnostico === "recomendacao_ia" && baseBrowserLegado ? gerarHash(baseBrowserLegado) : "",
    dadosNormalizados: {
      tipoDiagnostico,
      empresa,
      cidade,
      segmento,
      principalProduto
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

    const mesmaChaveDoPedido = Boolean(
      lead.limiterKey &&
        (lead.limiterKey === chaves.limiterKey ||
          (chaves.legacyLimiterKey && lead.limiterKey === chaves.legacyLimiterKey))
    );

    const mesmaChaveDoNavegador = Boolean(
      lead.browserLimiterKey &&
        (lead.browserLimiterKey === chaves.browserLimiterKey ||
          (chaves.legacyBrowserLimiterKey && lead.browserLimiterKey === chaves.legacyBrowserLimiterKey))
    );

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
      "O resultado anterior continua disponível no histórico deste vendedor.",
    leadAnterior: {
      empresa: lead.empresa,
      cidade: lead.cidade,
      segmento: lead.segmento,
      principalProduto: lead.principalProduto || "",
      tipoDiagnostico: lead.tipoDiagnostico || "recomendacao_ia",
      dataEnvio: lead.dataEnvio,
      diagnosticoStatus: lead.diagnosticoStatus
    }
  };
}
