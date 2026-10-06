import { gerarReputacaoComOpenAI } from "./openai-reputacao.service.js";
import { enriquecerPerfilGoogle } from "./google-business-profile.service.js";

function temChaveOpenAIValida() {
  const chave = process.env.OPENAI_API_KEY?.trim();
  return Boolean(chave && chave !== "COLE_SUA_CHAVE_OPENAI_AQUI" && chave.length >= 20);
}

function emitirProgresso(onProgress, event) {
  if (typeof onProgress !== "function") return;
  try {
    onProgress({ ...event, timestamp: new Date().toISOString() });
  } catch {
    // O diagnóstico deve continuar mesmo se o cliente desconectar do stream.
  }
}

export async function gerarDiagnosticoReputacao(formData, options = {}) {
  const { onProgress } = options;
  if (!temChaveOpenAIValida()) {
    const error = new Error(
      "A pesquisa pública necessária para analisar reputação não está disponível neste momento. Nenhuma nota fictícia foi gerada."
    );
    error.code = "PESQUISA_INDISPONIVEL";
    throw error;
  }

  try {
    console.log("[reputacao] IA iniciada", { empresa: formData.empresa, cidade: formData.cidade });
    emitirProgresso(onProgress, {
      key: "google_profile",
      label: "Confirmando o Perfil da Empresa",
      detail: "Resolvendo o link do Google e procurando a correspondência oficial quando disponível."
    });
    const formDataEnriquecido = await enriquecerPerfilGoogle(formData);

    console.log("[reputacao] Perfil da Empresa preparado", {
      empresa: formData.empresa,
      resolucao: formDataEnriquecido.perfilGoogleResolucao,
      linkResolvido: formDataEnriquecido.perfilGoogleResolvido !== formData.perfilGoogle
    });

    emitirProgresso(onProgress, {
      key: "google_ready",
      label: formDataEnriquecido.perfilGoogleDadosOficiais ? "Perfil oficial confirmado" : "Identidade digital preparada",
      detail: formDataEnriquecido.perfilGoogleDadosOficiais
        ? "Nota, volume de avaliações e avaliações públicas foram vinculados à empresa correta."
        : "A análise seguirá com os sinais públicos disponíveis, sem inventar dados do Google.",
      meta: {
        placesStatus: formDataEnriquecido.perfilGooglePlacesStatus || "",
        officialProfile: Boolean(formDataEnriquecido.perfilGoogleDadosOficiais)
      }
    });

    const resultado = await gerarReputacaoComOpenAI(formDataEnriquecido, { onProgress });
    console.log("[reputacao] IA concluída", { empresa: formData.empresa, status: resultado.status });
    return resultado;
  } catch (error) {
    console.error("[reputacao] erro na análise:", error.message);
    throw error;
  }
}
