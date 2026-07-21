import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gerarDiagnosticoComIA } from "./services/diagnostico-ai.service.js";
import { gerarDiagnosticoReputacao } from "./services/reputacao-ai.service.js";
import { validarFormularioDiagnostico, validarFormularioReputacao } from "./services/validation.service.js";
import { listarLeads, salvarLead } from "./services/leads.repository.js";
import { enviarLeadParaWebhook } from "./services/webhook.service.js";
import {
  criarChavesLimiter,
  encontrarDiagnosticoDuplicado,
  montarRespostaBloqueio,
  obterBlockDays,
  permitirDiagnosticosRepetidos,
  obterClientId,
  obterIpRequisicao
} from "./services/diagnostico-limiter.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3010;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const isProduction = process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";

function obterOrigemConfigurada() {
  try {
    return new URL(FRONTEND_URL).origin;
  } catch (error) {
    return FRONTEND_URL;
  }
}

const frontendOrigin = obterOrigemConfigurada();
const frontendHost = (() => {
  try {
    return new URL(FRONTEND_URL).host;
  } catch (error) {
    return "";
  }
})();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = isProduction
  ? [frontendOrigin]
  : [frontendOrigin, FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"];

function aplicarHeadersSeguranca(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );
  next();
}

const tentativasPorIp = new Map();
const tentativasDiariasPorIp = new Map();

function obterDataAtualYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

function verificarOrigemDoFormulario(req, res, next) {
  if (!isProduction) return next();

  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";

  const origemValida = origin === frontendOrigin;
  let refererValido = false;

  try {
    refererValido = Boolean(referer) && new URL(referer).host === frontendHost;
  } catch (error) {
    refererValido = false;
  }

  if (!origemValida && !refererValido) {
    return res.status(403).json({
      code: "ORIGEM_INVALIDA",
      message: "Não foi possível validar a origem da solicitação. Acesse o formulário pelo site oficial."
    });
  }

  return next();
}

function limparTentativasExpiradas() {
  const agora = Date.now();

  for (const [ip, registro] of tentativasPorIp.entries()) {
    if (registro.resetAt <= agora) {
      tentativasPorIp.delete(ip);
    }
  }

  const dataAtual = obterDataAtualYYYYMMDD();
  for (const [ip, registro] of tentativasDiariasPorIp.entries()) {
    if (registro.data !== dataAtual) {
      tentativasDiariasPorIp.delete(ip);
    }
  }
}


function sanitizarDiagnosticoPublico(diagnostico = {}) {
  const {
    tipoAnalise,
    nivelConfianca,
    pesquisasRealizadas,
    fontesConsultadas,
    geradoPor,
    observacaoTecnica,
    avisoSimulacao,
    ...publico
  } = diagnostico;

  return publico;
}

function limitarDiagnosticoPorIp(req, res, next) {
  limparTentativasExpiradas();

  const janelaMinutos = Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15;
  const maxTentativas = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;
  const janelaMs = janelaMinutos * 60 * 1000;
  const agora = Date.now();
  const ip = obterIpRequisicao(req);
  const registroAtual = tentativasPorIp.get(ip);

  const registro = registroAtual && registroAtual.resetAt > agora
    ? registroAtual
    : { count: 0, resetAt: agora + janelaMs };

  registro.count += 1;
  tentativasPorIp.set(ip, registro);

  const restante = Math.max(maxTentativas - registro.count, 0);
  res.setHeader("RateLimit-Limit", String(maxTentativas));
  res.setHeader("RateLimit-Remaining", String(restante));
  res.setHeader("RateLimit-Reset", String(Math.ceil((registro.resetAt - agora) / 1000)));

  if (registro.count > maxTentativas) {
    return res.status(429).json({
      code: "MUITAS_TENTATIVAS",
      message: "Muitas tentativas foram feitas em pouco tempo. Aguarde alguns minutos antes de tentar novamente."
    });
  }

  return next();
}

function limitarDiagnosticoDiarioPorIp(req, res, next) {
  const limiteDiario = Number(process.env.RATE_LIMIT_DAILY_MAX_REQUESTS) || 20;
  const ip = obterIpRequisicao(req);
  const dataAtual = obterDataAtualYYYYMMDD();
  const registroAtual = tentativasDiariasPorIp.get(ip);
  const registro = registroAtual?.data === dataAtual
    ? registroAtual
    : { count: 0, data: dataAtual };

  registro.count += 1;
  tentativasDiariasPorIp.set(ip, registro);

  res.setHeader("X-DailyLimit-Limit", String(limiteDiario));
  res.setHeader("X-DailyLimit-Remaining", String(Math.max(limiteDiario - registro.count, 0)));

  if (registro.count > limiteDiario) {
    return res.status(429).json({
      code: "LIMITE_DIARIO_ATINGIDO",
      message: "O limite diário de diagnósticos para esta conexão foi atingido. Tente novamente amanhã ou fale com nossa equipe pelo WhatsApp."
    });
  }

  return next();
}

app.use(aplicarHeadersSeguranca);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, !isProduction);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-client-id"],
    credentials: false,
    maxAge: 86400
  })
);

app.use(express.json({ limit: "250kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/diagnostico-reputacao", verificarOrigemDoFormulario, limitarDiagnosticoPorIp, limitarDiagnosticoDiarioPorIp, async (req, res) => {
  try {
    const validacao = validarFormularioReputacao(req.body);

    if (!validacao.isValid) {
      return res.status(400).json({
        message: "Confira os campos do formulário antes de continuar.",
        errors: validacao.errors
      });
    }

    const clientId = obterClientId(req);
    const blockDays = obterBlockDays();
    const chavesLimiter = criarChavesLimiter(validacao.data, clientId);

    if (!permitirDiagnosticosRepetidos()) {
      const leadsAtuais = await listarLeads();
      const diagnosticoDuplicado = encontrarDiagnosticoDuplicado(leadsAtuais, chavesLimiter, blockDays);

      if (diagnosticoDuplicado) {
        return res.status(409).json(montarRespostaBloqueio(diagnosticoDuplicado, blockDays));
      }
    }

    console.log("[reputacao] diagnóstico iniciado", {
      empresa: validacao.data.empresa,
      cidade: validacao.data.cidade,
      tipoDiagnostico: "reputacao"
    });

    const diagnostico = await gerarDiagnosticoReputacao(validacao.data);

    const lead = {
      ...validacao.data,
      tipoDiagnostico: "reputacao",
      dataEnvio: new Date().toISOString(),
      diagnosticoStatus: diagnostico.status,
      notaGeral: Number.isFinite(diagnostico.notaGeral) ? diagnostico.notaGeral : null,
      origem: "landing-diagnostico-ia",
      limiterKey: chavesLimiter.limiterKey,
      browserLimiterKey: chavesLimiter.browserLimiterKey,
      clientId,
      ip: obterIpRequisicao(req),
      userAgent: req.headers["user-agent"] || ""
    };

    await salvarLead(lead);
    enviarLeadParaWebhook(lead).catch((error) => {
      console.error("Falha assíncrona no webhook de reputação:", error.message);
    });

    console.log("[reputacao] diagnóstico concluído", {
      empresa: validacao.data.empresa,
      status: diagnostico.status,
      notaGeral: diagnostico.notaGeral
    });

    return res.json(diagnostico);
  } catch (error) {
    console.error("[reputacao] erro no endpoint:", error.message);

    if (error.code === "PESQUISA_INDISPONIVEL") {
      return res.status(503).json({
        code: "PESQUISA_INDISPONIVEL",
        message:
          "A pesquisa pública necessária para avaliar a reputação não está disponível neste momento. Nenhuma nota fictícia foi gerada. Tente novamente mais tarde."
      });
    }

    return res.status(502).json({
      code: "ERRO_PESQUISA_REPUTACAO",
      message:
        "Não foi possível concluir uma avaliação confiável da reputação neste momento. Nenhuma análise fictícia foi exibida."
    });
  }
});

app.post("/api/diagnostico-ia", verificarOrigemDoFormulario, limitarDiagnosticoPorIp, limitarDiagnosticoDiarioPorIp, async (req, res) => {
  try {
    const validacao = validarFormularioDiagnostico(req.body);

    if (!validacao.isValid) {
      return res.status(400).json({
        message: "Confira os campos do formulário antes de continuar.",
        errors: validacao.errors
      });
    }

    const clientId = obterClientId(req);
    const blockDays = obterBlockDays();
    const chavesLimiter = criarChavesLimiter(validacao.data, clientId);

    if (!permitirDiagnosticosRepetidos()) {
      const leadsAtuais = await listarLeads();
      const diagnosticoDuplicado = encontrarDiagnosticoDuplicado(leadsAtuais, chavesLimiter, blockDays);

      if (diagnosticoDuplicado) {
        return res.status(409).json(montarRespostaBloqueio(diagnosticoDuplicado, blockDays));
      }
    }

    const diagnostico = await gerarDiagnosticoComIA(validacao.data);
    const diagnosticoPublico = sanitizarDiagnosticoPublico(diagnostico);

    const lead = {
      ...validacao.data,
      tipoDiagnostico: "recomendacao_ia",
      dataEnvio: new Date().toISOString(),
      diagnosticoStatus: diagnosticoPublico.status,
      origem: "landing-diagnostico-ia",
      limiterKey: chavesLimiter.limiterKey,
      browserLimiterKey: chavesLimiter.browserLimiterKey,
      clientId,
      ip: obterIpRequisicao(req),
      userAgent: req.headers["user-agent"] || ""
    };

    await salvarLead(lead);
    enviarLeadParaWebhook(lead).catch((error) => {
      console.error("Falha assíncrona no webhook:", error.message);
    });

    return res.json(diagnosticoPublico);
  } catch (error) {
    console.error("Erro ao gerar diagnóstico:", error.message);
    return res.status(500).json({
      message: "Não foi possível gerar o diagnóstico neste momento. Tente novamente em alguns instantes."
    });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Endpoint não encontrado." });
});

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath, {
  dotfiles: "deny",
  etag: true,
  maxAge: isProduction ? "1h" : 0
}));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) {
      res.status(404).send("Página não encontrada.");
    }
  });
});

app.use((error, req, res, next) => {
  if (error?.message === "Origem não permitida.") {
    return res.status(403).json({ message: "Origem não permitida." });
  }

  return res.status(500).json({ message: "Erro interno." });
});

app.listen(PORT, () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
