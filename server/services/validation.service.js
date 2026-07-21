const LIMITES = {
  nome: 80,
  whatsapp: 30,
  empresa: 120,
  cidade: 80,
  segmento: 100
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

export function validarFormularioDiagnostico(body = {}) {
  const errors = {};
  const camposPermitidos = new Set(["nome", "whatsapp", "empresa", "cidade", "segmento", "website"]);

  for (const campo of Object.keys(body || {})) {
    if (!camposPermitidos.has(campo)) {
      errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
      break;
    }
  }

  if (body.website || body.site || body.url) {
    errors.formulario = "Não foi possível validar o envio. Atualize a página e tente novamente.";
  }

  const nomeOriginal = body.nome?.toString() || "";
  const whatsappOriginal = body.whatsapp?.toString() || "";
  const empresaOriginal = body.empresa?.toString() || "";
  const cidadeOriginal = body.cidade?.toString() || "";
  const segmentoOriginal = body.segmento?.toString() || "";

  const nome = limparCampo(nomeOriginal, LIMITES.nome);
  const whatsapp = limparCampo(whatsappOriginal, LIMITES.whatsapp);
  const empresa = limparCampo(empresaOriginal, LIMITES.empresa);
  const cidade = limparCampo(cidadeOriginal, LIMITES.cidade);
  const segmento = limparCampo(segmentoOriginal, LIMITES.segmento);

  if (!nome) {
    errors.nome = "Informe seu nome para personalizar o diagnóstico.";
  } else if (campoMuitoLongo(nomeOriginal, LIMITES.nome)) {
    errors.nome = "O nome está muito longo. Use até 80 caracteres.";
  }

  if (!whatsapp) {
    errors.whatsapp = "Informe seu WhatsApp para receber o convite depois.";
  } else if (whatsapp.replace(/\D/g, "").length < 8) {
    errors.whatsapp = "O WhatsApp precisa ter pelo menos 8 números.";
  } else if (campoMuitoLongo(whatsappOriginal, LIMITES.whatsapp)) {
    errors.whatsapp = "O WhatsApp está muito longo. Revise o número informado.";
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

  if (!segmento) {
    errors.segmento = "Informe o segmento da sua empresa.";
  } else if (campoMuitoLongo(segmentoOriginal, LIMITES.segmento)) {
    errors.segmento = "O segmento está muito longo. Use até 100 caracteres.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      nome,
      whatsapp,
      empresa,
      cidade,
      segmento
    }
  };
}
