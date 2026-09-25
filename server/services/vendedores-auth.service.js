import crypto from "node:crypto";

const vendedoresConfig = [
  { id: "roberto", nome: "Roberto", env: "VENDEDOR_ROBERTO_CODIGO" },
  { id: "marina", nome: "Marina", env: "VENDEDOR_MARINA_CODIGO" },
  { id: "valeria", nome: "Valeria", env: "VENDEDOR_VALERIA_CODIGO" },
  { id: "danielle", nome: "Danielle", env: "VENDEDOR_DANIELLE_CODIGO" },
  { id: "giovanna", nome: "Giovanna", env: "VENDEDOR_GIOVANNA_CODIGO" },
  { id: "matheus", nome: "Matheus", env: "VENDEDOR_MATHEUS_CODIGO" },
  { id: "yago", nome: "Yago", env: "VENDEDOR_YAGO_CODIGO" },
  { id: "alexandre", nome: "Alexandre", env: "VENDEDOR_ALEXANDRE_CODIGO" },
  { id: "priscilla", nome: "Priscilla", env: "VENDEDOR_PRISCILLA_CODIGO" },
  { id: "kevin", nome: "Kevin", env: "VENDEDOR_KEVIN_CODIGO" }
];

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function obterSecret() {
  const secret = (process.env.VENDEDOR_SESSION_SECRET || "").trim();

  if (secret.length < 32) {
    const error = new Error("VENDEDOR_SESSION_SECRET precisa ter pelo menos 32 caracteres.");
    error.code = "VENDEDOR_AUTH_NAO_CONFIGURADO";
    throw error;
  }

  return secret;
}

function assinar(payloadBase64) {
  return crypto.createHmac("sha256", obterSecret()).update(payloadBase64).digest("base64url");
}

function compararSeguro(valorRecebido, valorEsperado) {
  const recebido = Buffer.from(valorRecebido || "", "utf8");
  const esperado = Buffer.from(valorEsperado || "", "utf8");

  if (!recebido.length || recebido.length !== esperado.length) {
    return false;
  }

  return crypto.timingSafeEqual(recebido, esperado);
}

export function listarVendedoresConfigurados() {
  return vendedoresConfig
    .map((vendedor) => ({
      id: vendedor.id,
      nome: vendedor.nome,
      codigo: (process.env[vendedor.env] || "").trim()
    }))
    .filter((vendedor) => vendedor.codigo);
}

export function autenticarVendedorPorCodigo(codigo = "") {
  const codigoLimpo = codigo.toString().trim();

  if (!codigoLimpo) return null;

  const vendedores = listarVendedoresConfigurados();
  if (!vendedores.length) {
    const error = new Error("Nenhum código de vendedor foi configurado no .env.");
    error.code = "VENDEDOR_AUTH_NAO_CONFIGURADO";
    throw error;
  }

  for (const vendedor of vendedores) {
    if (compararSeguro(codigoLimpo, vendedor.codigo)) {
      return { id: vendedor.id, nome: vendedor.nome };
    }
  }

  return null;
}

export function criarSessaoVendedor(vendedor) {
  const horas = Number(process.env.VENDEDOR_SESSION_HOURS) || 12;
  const ttlMs = Math.max(1, Math.min(horas, 168)) * 60 * 60 * 1000;
  const agora = Date.now();
  const exp = agora + ttlMs;
  const payload = {
    sub: vendedor.id,
    nome: vendedor.nome,
    iat: agora,
    exp,
    jti: crypto.randomUUID()
  };
  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));
  const signature = assinar(payloadBase64);

  return {
    token: `${payloadBase64}.${signature}`,
    expiresAt: new Date(exp).toISOString()
  };
}

export function validarSessaoVendedor(token = "") {
  const partes = token.toString().split(".");
  if (partes.length !== 2) return null;

  const [payloadBase64, assinaturaRecebida] = partes;
  const assinaturaEsperada = assinar(payloadBase64);

  if (!compararSeguro(assinaturaRecebida, assinaturaEsperada)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadBase64));
  } catch {
    return null;
  }

  if (!payload?.sub || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) {
    return null;
  }

  const vendedorAtivo = listarVendedoresConfigurados().find((vendedor) => vendedor.id === payload.sub);
  if (!vendedorAtivo) return null;

  return {
    id: vendedorAtivo.id,
    nome: vendedorAtivo.nome,
    expiresAt: new Date(payload.exp).toISOString()
  };
}

export function extrairBearerToken(req) {
  const authorization = req.headers.authorization || "";
  if (typeof authorization !== "string") return "";

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}
