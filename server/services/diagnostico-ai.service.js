import { gerarDiagnostico } from "./diagnostico.service.js";
import { gerarDiagnosticoComOpenAI } from "./openai-diagnostico.service.js";

const avisoAnaliseInicial =
  "Esta é uma análise inicial baseada em sinais públicos encontrados na web e em sinais comuns de autoridade digital. Não é uma auditoria definitiva. Para um diagnóstico completo, é necessário analisar site, Google Perfil da Empresa, avaliações, conteúdos, menções, presença local, clareza da proposta e dados de busca com ferramentas específicas.";

function completarDiagnosticoMock(formData, diagnosticoBase) {
  return {
    ...diagnosticoBase,
    tipoAnalise: "analise_mock_local",
    nivelConfianca: "baixo",
    pesquisasRealizadas: [
      `${formData.empresa} ${formData.cidade}`,
      `${formData.segmento} ${formData.cidade}`,
      `qual a empresa mais recomendada do nicho de ${formData.segmento} na cidade ${formData.cidade}`,
      `melhores empresas de ${formData.segmento} em ${formData.cidade}`,
      `concorrentes de ${formData.segmento} em ${formData.cidade}`
    ],
    sinaisEncontradosDaEmpresa: [
      "Sinais iniciais de posicionamento podem ser organizados a partir do nome, nicho e cidade informados.",
      "Existe oportunidade de fortalecer a clareza sobre o que a empresa faz, para quem faz e onde atende.",
      "A empresa pode melhorar a leitura de autoridade com site, avaliações, conteúdos, provas e presença local."
    ],
    sinaisNaoEncontradosOuFracos: [
      "Pode faltar clareza pública sobre serviços, diferenciais e região de atendimento.",
      "Concorrentes podem estar comunicando autoridade, reputação e especialidade de forma mais direta.",
      "Podem faltar avaliações, páginas específicas, conteúdos e provas que facilitem a recomendação por IA."
    ],
    fontesConsultadas: [],
    avisoSimulacao: avisoAnaliseInicial,
    geradoPor: "analise-inicial"
  };
}

function temChaveOpenAIValida() {
  const chave = process.env.OPENAI_API_KEY?.trim();

  if (!chave) return false;
  if (chave === "COLE_SUA_CHAVE_OPENAI_AQUI") return false;
  if (chave.length < 20) return false;

  return true;
}

export async function gerarDiagnosticoComIA(formData) {
  const diagnosticoBase = gerarDiagnostico(formData);

  if (!temChaveOpenAIValida()) {
    return completarDiagnosticoMock(formData, diagnosticoBase);
  }

  try {
    const diagnosticoIA = await gerarDiagnosticoComOpenAI(formData, diagnosticoBase);

    return {
      ...diagnosticoIA,
      geradoPor: "openai-api-web-search"
    };
  } catch (error) {
    console.error("Erro ao chamar OpenAI com web search. Usando fallback local:", error);

    return completarDiagnosticoMock(formData, diagnosticoBase);
  }
}
