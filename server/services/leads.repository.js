import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const LEADS_FILE = path.join(DATA_DIR, "leadsDiagnosticoIA.json");

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
    return JSON.parse(conteudo);
  } catch {
    return [];
  }
}

export async function salvarLead(lead) {
  const leadsAtuais = await listarLeads();
  const leadsAtualizados = [lead, ...leadsAtuais];
  await fs.writeFile(LEADS_FILE, JSON.stringify(leadsAtualizados, null, 2), "utf8");
  return lead;
}
