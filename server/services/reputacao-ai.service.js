import { gerarReputacaoComOpenAI } from "./openai-reputacao.service.js";

function temChaveOpenAIValida() {
  const chave = process.env.OPENAI_API_KEY?.trim();
  return Boolean(chave && chave !== "COLE_SUA_CHAVE_OPENAI_AQUI" && chave.length >= 20);
}

export async function gerarDiagnosticoReputacao(formData) {
  if (!temChaveOpenAIValida()) {
    const error = new Error(
      "A pesquisa pública necessária para analisar reputação não está disponível neste momento. Nenhuma nota fictícia foi gerada."
    );
    error.code = "PESQUISA_INDISPONIVEL";
    throw error;
  }

  try {
    console.log("[reputacao] IA iniciada", { empresa: formData.empresa, cidade: formData.cidade });
    const resultado = await gerarReputacaoComOpenAI(formData);
    console.log("[reputacao] IA concluída", { empresa: formData.empresa, status: resultado.status });
    return resultado;
  } catch (error) {
    console.error("[reputacao] erro na análise:", error.message);
    throw error;
  }
}
