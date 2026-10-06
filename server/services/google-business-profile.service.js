const GOOGLE_HOSTS_EXATOS = new Set([
  "google.com",
  "www.google.com",
  "google.com.br",
  "www.google.com.br",
  "maps.google.com",
  "maps.google.com.br",
  "maps.app.goo.gl",
  "goo.gl",
  "g.page",
  "share.google"
]);

const GOOGLE_SUFFIXES = [".google.com", ".google.com.br"];
const GOOGLE_SHORT_HOSTS = new Set(["maps.app.goo.gl", "goo.gl", "g.page", "share.google"]);

function hostGooglePermitido(hostname = "") {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return GOOGLE_HOSTS_EXATOS.has(host) || GOOGLE_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function urlGoogleValida(valor = "") {
  try {
    const url = new URL(valor);
    return ["http:", "https:"].includes(url.protocol) && hostGooglePermitido(url.hostname);
  } catch {
    return false;
  }
}

function limitarTexto(valor = "", max = 180) {
  const texto = String(valor).replace(/\s+/g, " ").trim();
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

function extrairNomeDoMapsUrl(valor = "") {
  try {
    const url = new URL(valor);
    const matchPlace = decodeURIComponent(url.pathname).match(/\/maps\/place\/([^/]+)/i);
    const nomePlace = matchPlace?.[1]?.replace(/\+/g, " ").trim();
    if (nomePlace) return limitarTexto(nomePlace, 160);

    const query = url.searchParams.get("query") || url.searchParams.get("q");
    if (query) return limitarTexto(query, 160);
  } catch {
    // Falha de parsing não deve interromper o diagnóstico.
  }

  return "";
}

function normalizarComparacao(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function obterHostSite(valor = "") {
  try {
    return new URL(valor).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function pontuarLugarGoogle(lugar = {}, formData = {}) {
  const nomeLugar = normalizarComparacao(lugar?.displayName?.text || "");
  const empresa = normalizarComparacao(formData.empresa || "");
  const identificador = normalizarComparacao(formData.perfilGoogleIdentificador || "");
  const endereco = normalizarComparacao(lugar?.formattedAddress || "");
  const cidade = normalizarComparacao(formData.cidade || "");
  const hostLugar = obterHostSite(lugar?.websiteUri || "");
  const hostEmpresa = obterHostSite(formData.siteEmpresa || "");

  let score = 0;
  if (empresa && nomeLugar && (nomeLugar.includes(empresa) || empresa.includes(nomeLugar))) score += 4;
  if (identificador && nomeLugar && (nomeLugar.includes(identificador) || identificador.includes(nomeLugar))) score += 5;
  if (cidade && endereco.includes(cidade)) score += 2;
  if (hostLugar && hostEmpresa && hostLugar === hostEmpresa) score += 5;
  return score;
}

function normalizarReview(review = {}) {
  return {
    autor: limitarTexto(review?.authorAttribution?.displayName || "", 100),
    nota: Number.isFinite(review?.rating) ? review.rating : null,
    texto: limitarTexto(review?.text?.text || review?.originalText?.text || "", 700),
    publicadoEm: review?.publishTime || "",
    relativo: limitarTexto(review?.relativePublishTimeDescription || "", 100)
  };
}

async function lerErroGoogle(response) {
  try {
    const data = await response.json();
    return {
      code: data?.error?.status || data?.error?.code || "HTTP_ERROR",
      message: limitarTexto(data?.error?.message || `HTTP ${response.status}`, 260)
    };
  } catch {
    return { code: `HTTP_${response.status}`, message: `HTTP ${response.status}` };
  }
}

async function fetchComTimeout(url, options = {}, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function buscarDadosOficiaisPlaces(formData = {}, timeoutMs = 6500) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    return { dados: null, status: "chave_ausente" };
  }

  const nomeBusca = formData.perfilGoogleIdentificador || formData.empresa;
  const textQuery = [nomeBusca, formData.cidade].filter(Boolean).join(" ").trim();
  if (!textQuery) return { dados: null, status: "consulta_vazia" };

  try {
    const searchResponse = await fetchComTimeout(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.googleMapsUri",
            "places.websiteUri"
          ].join(",")
        },
        body: JSON.stringify({
          textQuery,
          languageCode: "pt-BR",
          regionCode: "BR",
          maxResultCount: 5
        })
      },
      timeoutMs
    );

    if (!searchResponse.ok) {
      const erro = await lerErroGoogle(searchResponse);
      console.warn("[reputacao] Google Places Text Search falhou", {
        httpStatus: searchResponse.status,
        code: erro.code,
        message: erro.message
      });
      return { dados: null, status: `search_http_${searchResponse.status}`, erro };
    }

    const searchData = await searchResponse.json();
    const lugares = Array.isArray(searchData?.places) ? searchData.places : [];
    if (!lugares.length) {
      console.warn("[reputacao] Google Places não encontrou candidatos", { textQuery });
      return { dados: null, status: "sem_candidatos" };
    }

    const classificados = lugares
      .map((lugar) => ({ lugar, score: pontuarLugarGoogle(lugar, formData) }))
      .sort((a, b) => b.score - a.score);

    const melhor = classificados[0];
    if (!melhor || melhor.score < 4 || !melhor.lugar?.id) {
      console.warn("[reputacao] Google Places encontrou candidatos, mas nenhum passou na validação", {
        textQuery,
        melhorScore: melhor?.score ?? null,
        melhorNome: melhor?.lugar?.displayName?.text || ""
      });
      return { dados: null, status: "correspondencia_insegura" };
    }

    const placeId = melhor.lugar.id;
    const detailsResponse = await fetchComTimeout(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "id",
            "displayName",
            "formattedAddress",
            "googleMapsUri",
            "websiteUri",
            "rating",
            "userRatingCount",
            "reviews"
          ].join(",")
        }
      },
      timeoutMs
    );

    if (!detailsResponse.ok) {
      const erro = await lerErroGoogle(detailsResponse);
      console.warn("[reputacao] Google Places Place Details falhou", {
        httpStatus: detailsResponse.status,
        code: erro.code,
        message: erro.message,
        placeId
      });
      return { dados: null, status: `details_http_${detailsResponse.status}`, erro };
    }

    const lugar = await detailsResponse.json();
    const reviews = Array.isArray(lugar?.reviews)
      ? lugar.reviews.map(normalizarReview).filter((review) => review.texto || Number.isFinite(review.nota)).slice(0, 5)
      : [];

    return {
      status: "ok",
      dados: {
        placeId: lugar.id || placeId,
        nome: limitarTexto(lugar?.displayName?.text || melhor.lugar?.displayName?.text || "", 160),
        endereco: limitarTexto(lugar?.formattedAddress || melhor.lugar?.formattedAddress || "", 220),
        googleMapsUri: lugar?.googleMapsUri || melhor.lugar?.googleMapsUri || "",
        websiteUri: lugar?.websiteUri || melhor.lugar?.websiteUri || "",
        rating: Number.isFinite(lugar?.rating) ? lugar.rating : null,
        userRatingCount: Number.isFinite(lugar?.userRatingCount) ? lugar.userRatingCount : null,
        reviews
      }
    };
  } catch (error) {
    const status = error?.name === "AbortError" ? "timeout" : "falha_rede";
    console.warn("[reputacao] Google Places indisponível", {
      status,
      message: limitarTexto(error?.message || "Erro desconhecido", 220)
    });
    return { dados: null, status };
  }
}

export function criarUrlBuscaGoogleMaps({ empresa = "", cidade = "" } = {}) {
  const query = [empresa, cidade].filter(Boolean).join(", ").trim();
  if (!query) return "";

  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

async function requisitarRedirectSeguro(urlAtual, timeoutMs) {
  const response = await fetchComTimeout(
    urlAtual,
    {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    },
    timeoutMs
  );

  const location = response.headers.get("location");
  if (response.body) response.body.cancel().catch(() => {});
  return { status: response.status, location };
}

export async function resolverUrlPerfilGoogle(perfilGoogle = "", options = {}) {
  const original = String(perfilGoogle || "").trim();
  const timeoutMs = Math.max(1000, Number(options.timeoutMs) || 5000);
  const maxRedirects = Math.max(1, Math.min(Number(options.maxRedirects) || 6, 10));

  if (!urlGoogleValida(original)) {
    return { original, resolvida: original, foiResolvida: false, motivo: "link_nao_google", identificador: "" };
  }

  const hostOriginal = new URL(original).hostname.toLowerCase();
  if (!GOOGLE_SHORT_HOSTS.has(hostOriginal)) {
    return {
      original,
      resolvida: original,
      foiResolvida: false,
      motivo: "link_direto",
      identificador: extrairNomeDoMapsUrl(original)
    };
  }

  let atual = original;
  let houveRedirect = false;

  try {
    for (let i = 0; i < maxRedirects; i += 1) {
      const { status, location } = await requisitarRedirectSeguro(atual, timeoutMs);
      if (status >= 300 && status < 400 && location) {
        const proxima = new URL(location, atual).toString();
        if (!urlGoogleValida(proxima)) {
          return {
            original,
            resolvida: atual,
            foiResolvida: houveRedirect,
            motivo: "redirect_fora_google",
            identificador: extrairNomeDoMapsUrl(atual)
          };
        }
        atual = proxima;
        houveRedirect = true;
        continue;
      }
      break;
    }

    return {
      original,
      resolvida: atual,
      foiResolvida: houveRedirect && atual !== original,
      motivo: houveRedirect ? "redirect_resolvido" : "link_direto",
      identificador: extrairNomeDoMapsUrl(atual)
    };
  } catch (error) {
    return {
      original,
      resolvida: original,
      foiResolvida: false,
      motivo: error?.name === "AbortError" ? "timeout" : "falha_resolucao",
      identificador: extrairNomeDoMapsUrl(original)
    };
  }
}

export async function enriquecerPerfilGoogle(formData = {}) {
  const resolucao = await resolverUrlPerfilGoogle(formData.perfilGoogle);
  const formDataComIdentificador = {
    ...formData,
    perfilGoogleIdentificador: resolucao.identificador || ""
  };
  const places = await buscarDadosOficiaisPlaces(formDataComIdentificador);
  const dadosOficiais = places.dados;

  const perfilGoogleBusca = criarUrlBuscaGoogleMaps({ empresa: formData.empresa, cidade: formData.cidade });
  const melhorUrl = dadosOficiais?.googleMapsUri || resolucao.resolvida || formData.perfilGoogle;

  console.log("[reputacao] Google Places", {
    empresa: formData.empresa,
    status: places.status,
    encontrou: Boolean(dadosOficiais),
    reviews: dadosOficiais?.reviews?.length || 0
  });

  return {
    ...formData,
    perfilGoogleOriginal: formData.perfilGoogle,
    perfilGoogleResolvido: melhorUrl,
    perfilGoogleBusca,
    perfilGoogleIdentificador: dadosOficiais?.nome || resolucao.identificador || "",
    perfilGoogleResolucao: dadosOficiais ? "places_api" : resolucao.motivo,
    perfilGooglePlacesStatus: places.status,
    perfilGoogleDadosOficiais: dadosOficiais
  };
}
