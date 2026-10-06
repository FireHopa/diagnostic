function valor(valor) {
  return typeof valor === "string" ? valor.trim() : String(valor ?? "").trim();
}

export function montarPayloadDiagnostico(formData = {}, tipoForcado = "") {
  const tipo = tipoForcado === "reputacao" || formData?.tipoDiagnostico === "reputacao"
    ? "reputacao"
    : "recomendacao_ia";

  const comum = {
    nome: valor(formData.nome),
    empresa: valor(formData.empresa),
    cidade: valor(formData.cidade),
    principalProduto: valor(formData.principalProduto),
    // Honeypot: precisa continuar sendo enviado caso tenha sido preenchido por um bot.
    website: valor(formData.website),
    tipoDiagnostico: tipo
  };

  if (tipo === "reputacao") {
    return {
      ...comum,
      siteEmpresa: valor(formData.siteEmpresa),
      perfilGoogle: valor(formData.perfilGoogle)
    };
  }

  return {
    ...comum,
    segmento: valor(formData.segmento)
  };
}

export function camposPayloadPorTipo(tipo) {
  return tipo === "reputacao"
    ? ["nome", "empresa", "cidade", "principalProduto", "siteEmpresa", "perfilGoogle", "website", "tipoDiagnostico"]
    : ["nome", "empresa", "cidade", "segmento", "principalProduto", "website", "tipoDiagnostico"];
}
