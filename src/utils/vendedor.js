const SESSION_KEY = "diagnosticoIAVendedorSessao";

function criarErroApi(response, data, fallback) {
  const error = new Error(data?.message || fallback);
  error.code = data?.code;
  error.status = response.status;
  error.payload = data;
  return error;
}

export function obterSessaoVendedor() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const sessao = JSON.parse(raw);
    if (!sessao?.token || !sessao?.vendedor?.id) return null;

    if (sessao.expiresAt && new Date(sessao.expiresAt).getTime() <= Date.now()) {
      limparSessaoVendedor();
      return null;
    }

    return sessao;
  } catch {
    return null;
  }
}

export function salvarSessaoVendedor(sessao) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
  return sessao;
}

export function limparSessaoVendedor() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function obterTokenVendedor() {
  return obterSessaoVendedor()?.token || "";
}

export async function loginVendedor(codigo) {
  const response = await fetch("/api/vendedor/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw criarErroApi(response, data, "Não foi possível validar o código do vendedor.");
  }

  return salvarSessaoVendedor(data);
}

export async function validarSessaoAtual() {
  const sessao = obterSessaoVendedor();
  if (!sessao?.token) return null;

  const response = await fetch("/api/vendedor/me", {
    headers: { Authorization: `Bearer ${sessao.token}` }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    limparSessaoVendedor();
    return null;
  }

  const atualizada = {
    ...sessao,
    vendedor: data.vendedor,
    expiresAt: data.expiresAt || sessao.expiresAt
  };
  salvarSessaoVendedor(atualizada);
  return atualizada;
}

export async function listarHistoricoVendedor({ limit = 50 } = {}) {
  const token = obterTokenVendedor();
  if (!token) throw new Error("Sessão do vendedor não encontrada.");

  const response = await fetch(`/api/historico-diagnosticos?limit=${encodeURIComponent(limit)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) limparSessaoVendedor();
    throw criarErroApi(response, data, "Não foi possível carregar o histórico.");
  }

  return data;
}

export async function obterDiagnosticoDoHistorico(diagnosticoId) {
  const token = obterTokenVendedor();
  if (!token) throw new Error("Sessão do vendedor não encontrada.");

  const response = await fetch(`/api/historico-diagnosticos/${encodeURIComponent(diagnosticoId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) limparSessaoVendedor();
    throw criarErroApi(response, data, "Não foi possível abrir este diagnóstico.");
  }

  return data;
}
