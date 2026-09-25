import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const LEADS_FILE = path.join(DATA_DIR, "leadsDiagnosticoIA.json");
let filaEscrita = Promise.resolve();

async function garantirArquivoDeLeads() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, "[]", "utf8");
  }
}

export async function listarLeads() {
  await garantirArquivoDeLeads();
  const conteudo = await fs.readFile(LEADS_FILE, "utf8");

  try {
    const leads = JSON.parse(conteudo);
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
}

export async function listarLeadsPorVendedor(vendedorId) {
  const leads = await listarLeads();
  return leads.filter((lead) => lead.vendedorId === vendedorId);
}

export async function buscarLeadDoVendedorPorId(vendedorId, diagnosticoId) {
  const leads = await listarLeadsPorVendedor(vendedorId);
  return leads.find((lead) => lead.diagnosticoId === diagnosticoId) || null;
}

export function salvarLead(lead) {
  const operacao = filaEscrita.then(async () => {
    const leadsAtuais = await listarLeads();
    const leadsAtualizados = [lead, ...leadsAtuais];
    const arquivoTemporario = `${LEADS_FILE}.${process.pid}.${Date.now()}.tmp`;

    await fs.writeFile(arquivoTemporario, JSON.stringify(leadsAtualizados, null, 2), "utf8");
    await fs.rename(arquivoTemporario, LEADS_FILE);
    return lead;
  });

  filaEscrita = operacao.catch(() => undefined);
  return operacao;
}
