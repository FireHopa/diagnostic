const PREFIX = "diagnostico_ia:last_result:v1";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function keyFor(vendedorId) {
  return vendedorId ? `${PREFIX}:${vendedorId}` : null;
}

export function salvarUltimoDiagnostico(vendedorId, snapshot) {
  const key = keyFor(vendedorId);
  if (!key || !snapshot?.diagnostico || !snapshot?.contexto) return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() }));
  } catch {
    // Persistência é conveniência de UX; o diagnóstico continua funcionando sem ela.
  }
}

export function carregarUltimoDiagnostico(vendedorId) {
  const key = keyFor(vendedorId);
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const savedAt = new Date(parsed?.savedAt || 0).getTime();
    if (!parsed?.diagnostico || !parsed?.contexto || !Number.isFinite(savedAt) || Date.now() - savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
