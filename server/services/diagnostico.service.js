const palavrasFortes = [
  "premium",
  "consultoria",
  "digital",
  "contabilidade",
  "contabilista",
  "advogados",
  "clínica",
  "clinica",
  "grupo",
  "especialistas",
  "expert",
  "prime"
];

const motivosPadrao = [
  "Possuem presença digital mais clara e consistente para humanos e inteligências artificiais.",
  "Deixam sinais públicos de confiança, reputação, especialidade e atuação local.",
  "Têm conteúdos, páginas ou menções que ajudam a IA a entender o que fazem e onde atendem.",
  "Apresentam provas de autoridade, como avaliações, depoimentos, cases, diferenciais ou histórico.",
  "Comunicam melhor seus serviços, público atendido e motivos para serem escolhidas."
];

const problemasUrgentesPadrao = [
  "Site pouco claro para humanos e inteligências artificiais",
  "Poucas avaliações ou avaliações sem palavras-chave relevantes",
  "Falta de páginas específicas para serviços e cidade",
  "Pouca presença em conteúdos, artigos, redes sociais e menções externas",
  "Falta de prova de autoridade, como cases, depoimentos e diferenciais",
  "Google Perfil da Empresa incompleto ou mal otimizado"
];

const proximosPassosPadrao = [
  "Organizar o site para explicar quem é a empresa, o que faz, para quem faz e onde atende",
  "Melhorar avaliações no Google com palavras naturais dos clientes",
  "Criar conteúdos que respondam perguntas reais dos clientes",
  "Reforçar autoridade com cases, depoimentos, números e diferenciais",
  "Preparar a empresa para ser compreendida por humanos e agentes de IA"
];

const avisoAnaliseInicial =
  "Esta é uma análise inicial baseada em sinais públicos encontrados na web e em sinais comuns de autoridade digital. Não é uma auditoria definitiva. Para um diagnóstico completo, é necessário analisar site, Google Perfil da Empresa, avaliações, conteúdos, menções, presença local, clareza da proposta e dados de busca com ferramentas específicas.";

const avisoPerguntasClientes =
  "Estas perguntas são uma estimativa estratégica criada com base no comportamento de busca, nas dúvidas comuns do público e nas etapas de decisão de compra. Não representam volume oficial de buscas nem acesso ao histórico privado de perguntas de usuários do ChatGPT, Gemini, IA do Google ou outras plataformas.";

export function normalizarTexto(texto = "") {
  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function capitalizar(texto = "") {
  const limpo = texto.toString().trim();
  if (!limpo) return "Empresa";

  return limpo
    .split(" ")
    .filter(Boolean)
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(" ");
}

function gerarEmpresasMaisRecomendadas(segmento, cidade, empresa, aparece) {
  const segmentoFormatado = capitalizar(segmento);
  const cidadeFormatada = capitalizar(cidade);

  const nomesBase = [
    `Referência ${segmentoFormatado} ${cidadeFormatada}`,
    `${segmentoFormatado} Prime ${cidadeFormatada}`,
    `Grupo Autoridade ${segmentoFormatado}`,
    `Especialistas ${segmentoFormatado} ${cidadeFormatada}`,
    `Centro ${segmentoFormatado} de ${cidadeFormatada}`
  ];

  const nomes = aparece ? [empresa, ...nomesBase.slice(0, 4)] : nomesBase;

  return nomes.slice(0, 5).map((nome, index) => ({
    posicao: index + 1,
    nome,
    resumoAutoridade:
      index === 0 && aparece
        ? "A empresa analisada apresenta sinais iniciais que podem ajudar a IA a entendê-la melhor, mas ainda precisa consolidar autoridade pública."
        : "Empresa usada como exemplo demonstrativo de concorrente com sinais digitais mais organizados.",
    porQueTemMaisAutoridade:
      index === 0 && aparece
        ? "O nome, a proposta ou os sinais iniciais transmitem alguma especialidade, mas a recomendação ainda depende de site, avaliações, conteúdos, presença local e provas públicas."
        : "A IA tende a priorizar empresas que comunicam claramente serviço, localização, reputação, diferenciais e provas de confiança.",
    sinaisFortes: [
      "Clareza sobre o segmento e a cidade atendida",
      "Possíveis sinais de reputação e presença local",
      "Maior facilidade para a IA entender o posicionamento"
    ],
    possiveisFraquezas: [
      "Pode precisar de mais provas públicas de autoridade e reputação",
      "Pode depender de páginas, avaliações e conteúdos mais específicos para o nicho e cidade"
    ]
  }));
}

function gerarEmpresasRecomendadas(segmento, cidade, empresa, aparece) {
  return gerarEmpresasMaisRecomendadas(segmento, cidade, empresa, aparece).map((item) => item.nome);
}

function gerarQuatroQs(formData, aparece, empresasMaisRecomendadas) {
  const empresa = formData.empresa?.trim();
  const cidade = formData.cidade?.trim();
  const segmento = formData.segmento?.trim();
  const principalProduto = formData.principalProduto?.trim();
  const top5 = empresasMaisRecomendadas.map((item) => item.nome).join(", ");

  return {
    quemIARecomenda: `Nesta simulação, a IA tende a recomendar empresas com sinais mais claros no nicho de ${segmento} em ${cidade}, especialmente para buscas relacionadas a ${principalProduto}. As 5 principais referências demonstrativas são: ${top5}.`,
    porqueEssasEmpresasSaoEscolhidas:
      "Elas parecem mais fáceis de entender porque apresentam sinais de autoridade, reputação, presença local, clareza de serviços e provas de confiança.",
    porqueMinhaEmpresaNaoERecomendada: aparece
      ? `A ${empresa} já apresenta sinais iniciais, mas pode não ser recomendada sempre se concorrentes tiverem avaliações melhores, páginas mais específicas, mais conteúdos e mais menções externas.`
      : `A ${empresa} pode não ser recomendada porque a IA ainda não encontra sinais suficientes de autoridade, reputação, clareza, presença local e confiança pública.`,
    pontosFortesFracosEOQuePrecisaSerFeito:
      "O ponto forte é que esses sinais podem ser construídos. O ponto fraco é que, sem site claro, avaliações qualificadas, páginas por serviço/cidade e provas de autoridade, a IA pode escolher concorrentes mais bem posicionados."
  };
}

function gerarDiagnosticoDaEmpresa(formData, aparece) {
  const empresa = formData.empresa?.trim();
  const principalProduto = formData.principalProduto?.trim();

  return {
    resumoEmpresa: aparece
      ? `${empresa} apresenta sinais iniciais que podem ajudar na compreensão por inteligências artificiais, inclusive sobre seu principal produto (${principalProduto}), mas ainda precisa consolidar autoridade digital para disputar recomendações com mais frequência.`
      : `${empresa} ainda precisa fortalecer sua presença pública para que humanos e inteligências artificiais entendam com clareza quem é, onde atende, como se posiciona e por que seu principal produto (${principalProduto}) deve ser escolhido.`,
    pontosFortes: aparece
      ? [
          "Nome ou posicionamento com sinais iniciais de especialidade",
          "Potencial para ser melhor compreendida pela IA com ajustes estruturais",
          "Base inicial para construir autoridade local"
        ]
      : [
          "Existe oportunidade de posicionamento antes de concorrentes menos preparados",
          "A empresa pode transformar site, avaliações e conteúdos em ativos de recomendação",
          "A clareza da proposta pode ser rapidamente melhorada"
        ],
    pontosFracos: [
      "A autoridade pública ainda pode estar pouco organizada",
      "A IA pode encontrar concorrentes com sinais mais claros de reputação",
      "Podem faltar páginas específicas por serviço, nicho e cidade"
    ],
    prioridadeMaxima:
      "Criar uma base digital clara para explicar quem é a empresa, o que faz, para quem faz, onde atende, quais provas possui e por que merece ser recomendada."
  };
}

function gerarAnalisePerguntasClientes(formData) {
  const segmento = formData.segmento?.trim() || "este mercado";
  const cidade = formData.cidade?.trim() || "minha região";
  const principalProduto = formData.principalProduto?.trim() || "esse serviço";

  const grupos = {
    entenderProblema: [
      `Como saber se eu realmente preciso de ${principalProduto}?`,
      `Quais problemas ${principalProduto} costuma resolver?`,
      `Quando vale a pena procurar uma empresa de ${segmento}?`,
      `Quais sinais mostram que eu deveria buscar ajuda para isso?`,
      `O que pode acontecer se eu adiar a contratação de ${principalProduto}?`,
      `Como funciona ${principalProduto} na prática?`
    ],
    procurarSolucao: [
      `Quais são as melhores opções de ${principalProduto} em ${cidade}?`,
      `Como escolher uma empresa de ${segmento} para ${principalProduto}?`,
      `O que uma boa empresa de ${segmento} precisa oferecer?`,
      `Onde encontrar especialistas em ${principalProduto} em ${cidade}?`,
      `Qual tipo de profissional ou empresa devo procurar para ${principalProduto}?`,
      `O que devo avaliar antes de pedir um orçamento de ${principalProduto}?`
    ],
    compararOpcoes: [
      `Como comparar empresas que oferecem ${principalProduto} em ${cidade}?`,
      `O que diferencia uma empresa realmente boa de ${segmento} das outras?`,
      `Vale mais a pena escolher ${principalProduto} pelo preço ou pela experiência da empresa?`,
      `Quais critérios devo usar para comparar dois orçamentos de ${principalProduto}?`,
      `Como saber qual empresa de ${segmento} oferece o melhor custo-benefício?`,
      `O que devo comparar além do preço antes de contratar ${principalProduto}?`
    ],
    precoConfiancaReputacao: [
      `Quanto custa ${principalProduto} em ${cidade}?`,
      `Como saber se uma empresa de ${segmento} é confiável?`,
      `Quais avaliações devo olhar antes de contratar ${principalProduto}?`,
      `Como identificar se as avaliações de uma empresa são realmente confiáveis?`,
      `Que perguntas devo fazer antes de fechar um orçamento de ${principalProduto}?`,
      `Como saber se o preço de ${principalProduto} está justo ou muito barato?`
    ],
    proximasDeComprar: [
      `Qual é a melhor empresa para contratar ${principalProduto} em ${cidade}?`,
      `Quais empresas de ${segmento} são mais recomendadas em ${cidade}?`,
      `Quem tem as melhores avaliações para ${principalProduto} em ${cidade}?`,
      `Quero contratar ${principalProduto}: quais empresas devo comparar primeiro?`,
      `Onde posso pedir orçamento de ${principalProduto} em ${cidade}?`,
      `Entre as principais empresas de ${segmento} em ${cidade}, qual parece mais confiável para contratar?`
    ]
  };

  return {
    avisoMetodologico: avisoPerguntasClientes,
    grupos,
    maiorIntencaoContratacao: [
      grupos.proximasDeComprar[0],
      grupos.proximasDeComprar[1],
      grupos.proximasDeComprar[2],
      grupos.proximasDeComprar[3],
      grupos.proximasDeComprar[4],
      grupos.proximasDeComprar[5],
      grupos.precoConfiancaReputacao[0],
      grupos.precoConfiancaReputacao[1],
      grupos.precoConfiancaReputacao[4],
      grupos.compararOpcoes[3]
    ],
    perguntasPrioritarias: [
      grupos.proximasDeComprar[0],
      grupos.procurarSolucao[1],
      grupos.precoConfiancaReputacao[0],
      grupos.precoConfiancaReputacao[1],
      grupos.compararOpcoes[0],
      grupos.compararOpcoes[1],
      grupos.entenderProblema[0],
      grupos.entenderProblema[5],
      grupos.precoConfiancaReputacao[2],
      grupos.proximasDeComprar[3]
    ],
    temasConteudo: [
      `Preço, orçamento e custo-benefício de ${principalProduto}`,
      `Como escolher uma empresa confiável de ${segmento}`,
      `Comparativos e critérios para decidir entre fornecedores`,
      `Avaliações, reputação e prova social antes da contratação`,
      `Como funciona ${principalProduto}: processo, etapas e expectativas`,
      `Problemas, necessidades e sinais que levam à busca por ${principalProduto}`,
      `Dúvidas e objeções antes de contratar ${principalProduto}`,
      `Melhores opções e referências locais de ${segmento} em ${cidade}`
    ]
  };
}

export function gerarDiagnostico(formData) {
  const nome = formData.nome?.trim();
  const empresa = formData.empresa?.trim();
  const cidade = formData.cidade?.trim();
  const segmento = formData.segmento?.trim();
  const principalProduto = formData.principalProduto?.trim();

  const empresaNormalizada = normalizarTexto(empresa);
  const contemPalavraForte = palavrasFortes.some((palavra) =>
    empresaNormalizada.includes(normalizarTexto(palavra))
  );

  const aparece = empresa.length > 12 || contemPalavraForte;
  const empresasMaisRecomendadas = gerarEmpresasMaisRecomendadas(segmento, cidade, empresa, aparece);
  const empresasRecomendadas = gerarEmpresasRecomendadas(segmento, cidade, empresa, aparece);
  const perguntaPrincipal = `Qual a empresa mais recomendada do nicho de ${segmento} na cidade ${cidade}?`;

  return {
    status: aparece ? "aparece" : "nao_aparece",
    tipoAnalise: "analise_mock_local",
    nivelConfianca: "baixo",
    perguntaPrincipal,
    titulo: aparece
      ? `${nome}, sua empresa aparece com sinais iniciais, mas ainda precisa disputar autoridade com concorrentes.`
      : `${nome}, sua empresa ainda não aparece como uma das principais recomendações simuladas da IA.`,
    resumo: aparece
      ? "Boa notícia: sua empresa apresenta sinais iniciais de autoridade digital. Mesmo assim, a primeira leitura da IA não deve ser apenas sobre a sua empresa, mas sobre quem ela provavelmente recomendaria no seu lugar e por quê."
      : "Sua empresa ainda não apareceu entre as principais recomendações simuladas pela IA. Isso não significa que sua empresa seja ruim. Significa que, pelos sinais analisados nesta demonstração, concorrentes podem estar mais fáceis de entender e recomendar.",
    quatroQsResumo: gerarQuatroQs(formData, aparece, empresasMaisRecomendadas),
    empresasMaisRecomendadas,
    empresasRecomendadas,
    pesquisasRealizadas: [
      `${empresa} ${cidade}`,
      `${segmento} ${cidade}`,
      `${principalProduto} ${cidade}`,
      `qual a empresa mais recomendada do nicho de ${segmento} na cidade ${cidade}`,
      `melhores empresas de ${segmento} em ${cidade}`,
      `${segmento} perto de mim ${cidade}`
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
    motivosDasEmpresasIndicadas: motivosPadrao,
    porQueSuaEmpresaPodeNaoAparecer: aparece
      ? "Mesmo quando a empresa tem bons sinais iniciais, ela pode não aparecer em todas as respostas se concorrentes tiverem mais avaliações, conteúdo mais específico, autoridade local mais forte, menções externas e páginas mais claras sobre serviços e cidade."
      : "A IA tende a recomendar empresas que deixam mais evidente quem são, o que fazem, onde atendem, quais problemas resolvem, quais provas possuem e por que são confiáveis. Quando essas informações estão fracas ou espalhadas, sua empresa pode ser ignorada nas respostas.",
    diagnosticoDaEmpresa: gerarDiagnosticoDaEmpresa(formData, aparece),
    analisePerguntasClientes: gerarAnalisePerguntasClientes(formData),
    problemasUrgentes: problemasUrgentesPadrao,
    proximosPassos: proximosPassosPadrao,
    fontesConsultadas: [],
    chamadaFinal:
      "O próximo movimento é entender quem a IA recomenda hoje e construir os sinais para sua empresa entrar nessa disputa.",
    avisoSimulacao: avisoAnaliseInicial
  };
}
