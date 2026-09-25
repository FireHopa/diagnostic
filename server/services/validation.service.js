const LIMITES = {
  nome: 80,
  empresa: 120,
  cidade: 80,
  segmento: 100,
  principalProduto: 160,
  url: 500
};

function limparCampo(valor = "", limite = 120) {
  return valor
    .toString()
    .replace(/[<>]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limite);
}

function campoMuitoLongo(valor = "", limite) {
  return valor.toString().trim().length > limite;
}

function validarCamposComuns(body, errors) {
  const nomeOriginal = body.nome?.toString() || "";
  const empresaOriginal = body.empresa?.toString() || "";
  const cidadeOriginal = body.cidade?.toString() || "";
  const principalProdutoOriginal = body.principalProduto?.toString() || "";

  const nome = limparCampo(nomeOriginal, LIMITES.nome);
  const empresa = limparCampo(empresaOriginal, LIMITES.empresa);
  const cidade = limparCampo(cidadeOriginal, LIMITES.cidade);
  const principalProduto = limparCampo(principalProdutoOriginal, LIMITES.principalProduto);

  if (!nome) {
    errors.nome = "Informe seu nome para personalizar o diagnóstico.";
  } else if (campoMuitoLongo(nomeOriginal, LIMITES.nome)) {
    errors.nome = "O nome está muito longo. Use até 80 caracteres.";
  }

  if (!empresa) {
    errors.empresa = "Informe o nome da empresa que será analisada.";
  } else if (empresa.length < 2) {
    errors.empresa = "O nome da empresa precisa ter pelo menos 2 caracteres.";
  } else if (campoMuitoLongo(empresaOriginal, LIMITES.empresa)) {
    errors.empresa = "O nome da empresa está muito longo. Use até 120 caracteres.";
  }

  if (!cidade) {
    errors.cidade = "Informe a cidade onde sua empresa atua.";
  } else if (campoMuitoLongo(cidadeOriginal, LIMITES.cidade)) {
    errors.cidade = "A cidade está muito longa. Use até 80 caracteres.";
  }

  if (!principalProduto) {
    errors.principalProduto = "Informe o principal produto ou serviço da empresa.";
  } else if (campoMuitoLongo(principalProdutoOriginal, LIMITES.principalProduto)) {
    errors.principalProduto = "O principal produto está muito longo. Use até 160 caracteres.";
  }

  return { nome, empresa, cidade, principalProduto };
}

function normalizarUrl(valor = "") {
  const texto = limparCampo(valor, LIMITES.url);
  if (!texto) return "";

  const candidato = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`;

  try {
    const url = new URL(candidato);

    if (!["http:", "https:"].includes(url.protocol) || !url.hostname || !url.hostname.includes(".")) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function validarHoneypot(body, errors) {
  if (body.website) {
    errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
  }
}

export function validarFormularioDiagnostico(body = {}) {
  const errors = {};
  const camposPermitidos = new Set([
    "nome",
    "empresa",
    "cidade",
    "segmento",
    "principalProduto",
    "website",
    "tipoDiagnostico"
  ]);

  for (const campo of Object.keys(body || {})) {
    if (!camposPermitidos.has(campo)) {
      errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
      break;
    }
  }

  if (body.site || body.url) {
    errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
  }

  validarHoneypot(body, errors);
  const comuns = validarCamposComuns(body, errors);

  const segmentoOriginal = body.segmento?.toString() || "";
  const segmento = limparCampo(segmentoOriginal, LIMITES.segmento);

  if (!segmento) {
    errors.segmento = "Informe o segmento da sua empresa.";
  } else if (campoMuitoLongo(segmentoOriginal, LIMITES.segmento)) {
    errors.segmento = "O segmento está muito longo. Use até 100 caracteres.";
  }

  if (body.tipoDiagnostico && body.tipoDiagnostico !== "recomendacao_ia") {
    errors.tipoDiagnostico = "Tipo de diagnóstico inválido para esta análise.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      ...comuns,
      segmento,
      tipoDiagnostico: "recomendacao_ia"
    }
  };
}

export function validarFormularioReputacao(body = {}) {
  const errors = {};
  const camposPermitidos = new Set([
    "nome",
    "empresa",
    "cidade",
    "principalProduto",
    "perfilGoogle",
    "siteEmpresa",
    "website",
    "tipoDiagnostico"
  ]);

  for (const campo of Object.keys(body || {})) {
    if (!camposPermitidos.has(campo)) {
      errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
      break;
    }
  }

  validarHoneypot(body, errors);
  const comuns = validarCamposComuns(body, errors);

  const perfilGoogleOriginal = body.perfilGoogle?.toString() || "";
  const siteEmpresaOriginal = body.siteEmpresa?.toString() || "";
  const perfilGoogle = normalizarUrl(perfilGoogleOriginal);
  const siteEmpresa = normalizarUrl(siteEmpresaOriginal);

  if (!perfilGoogleOriginal.trim()) {
    errors.perfilGoogle = "Informe o link do Perfil da Empresa no Google.";
  } else if (campoMuitoLongo(perfilGoogleOriginal, LIMITES.url) || !perfilGoogle) {
    errors.perfilGoogle = "Informe um link válido do Perfil da Empresa no Google.";
  }

  if (!siteEmpresaOriginal.trim()) {
    errors.siteEmpresa = "Informe o site da empresa.";
  } else if (campoMuitoLongo(siteEmpresaOriginal, LIMITES.url) || !siteEmpresa) {
    errors.siteEmpresa = "Informe um endereço de site válido.";
  }

  if (body.tipoDiagnostico && body.tipoDiagnostico !== "reputacao") {
    errors.tipoDiagnostico = "Tipo de diagnóstico inválido para esta análise.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      ...comuns,
      perfilGoogle,
      siteEmpresa,
      tipoDiagnostico: "reputacao"
    }
  };
}
