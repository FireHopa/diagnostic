const TOOLBAR_ID = "diagnostico-export-toolbar";
const BRAND_LOGO = "https://casadoads.com.br/wp-content/webp-express/webp-images/uploads/2025/02/logo_imersao_360_nova.png.webp";

function slugify(value = "diagnostico-ia") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "diagnostico-ia";
}

function nomeArquivo(resultado) {
  const empresa = resultado.querySelector("h2")?.textContent?.trim() || "diagnostico-ia";
  return `diagnostico-ia-${slugify(empresa)}`;
}

function coletarCss() {
  let css = `
    * { box-sizing: border-box; }
    html, body { background: #fff !important; }
    body { margin: 0; color: #1f1f1f; font-family: Inter, Arial, Helvetica, sans-serif; }
    #${TOOLBAR_ID} { display: none !important; }
    .export-brand-header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:0 0 22px; margin:0 0 28px; border-bottom:1px solid #e5e7eb; }
    .export-brand-header img { width:150px; height:auto; object-fit:contain; }
    .export-brand-title { text-align:right; font-size:12px; line-height:1.5; color:#5f6368; }
    @page { size: A4; margin: 12mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: inherit; text-decoration: none; }
      button { display:none !important; }
      details { display:block !important; }
      details > * { display:block !important; }
    }
  `;

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      css += Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join("\n");
    } catch {
      // Folhas externas protegidas por CORS são ignoradas sem afetar a exportação.
    }
  }

  return css;
}

function markupResultado(resultado) {
  const clone = resultado.cloneNode(true);
  clone.querySelector(`#${TOOLBAR_ID}`)?.remove();
  clone.querySelectorAll("button").forEach((button) => button.remove());
  clone.querySelectorAll("details").forEach((details) => details.setAttribute("open", ""));

  return `
    <div class="export-brand-header">
      <img src="${BRAND_LOGO}" alt="Casa do Ads" />
      <div class="export-brand-title">
        <strong>Diagnóstico com Inteligência Artificial</strong><br />
        Autoridade, presença digital e reputação
      </div>
    </div>
    ${clone.innerHTML}
  `;
}

function documentoCompleto(resultado, extraCss = "") {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Diagnóstico IA | Casa do Ads</title>
<style>${coletarCss()}${extraCss}</style>
</head>
<body>
  <main style="max-width:920px;margin:0 auto;padding:28px 20px 48px;">
    ${markupResultado(resultado)}
  </main>
</body>
</html>`;
}

function baixarBlob(conteudo, tipo, nome) {
  const blob = new Blob(["\ufeff", conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportarWord(resultado) {
  const nome = `${nomeArquivo(resultado)}.doc`;
  baixarBlob(
    documentoCompleto(resultado, "body{font-size:10.5pt;} main{width:100%;}"),
    "application/msword;charset=utf-8",
    nome
  );
}

function exportarHtml(resultado) {
  const nome = `${nomeArquivo(resultado)}.html`;
  baixarBlob(documentoCompleto(resultado), "text/html;charset=utf-8", nome);
}

function exportarPdf(resultado) {
  const janela = window.open("", "_blank", "noopener,noreferrer");
  if (!janela) {
    window.alert("O navegador bloqueou a janela de exportação. Libere pop-ups para salvar o PDF.");
    return;
  }

  janela.document.open();
  janela.document.write(documentoCompleto(resultado, "@media print{main{padding:0!important;}}"));
  janela.document.close();

  const imprimir = () => {
    janela.focus();
    janela.print();
  };

  if (janela.document.readyState === "complete") {
    window.setTimeout(imprimir, 450);
  } else {
    janela.addEventListener("load", () => window.setTimeout(imprimir, 450), { once: true });
  }
}

function criarBotao(label, onClick, primary = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.cssText = [
    "border-radius:12px",
    "padding:10px 14px",
    "font:600 13px Inter,Arial,sans-serif",
    "cursor:pointer",
    "transition:all .18s ease",
    primary ? "background:#4285F4" : "background:#fff",
    primary ? "color:#fff" : "color:#3c4043",
    primary ? "border:1px solid #4285F4" : "border:1px solid #dadce0"
  ].join(";");
  button.addEventListener("click", onClick);
  return button;
}

function instalarToolbar() {
  const resultado = document.getElementById("resultado");
  if (!resultado || document.getElementById(TOOLBAR_ID)) return;

  const toolbar = document.createElement("div");
  toolbar.id = TOOLBAR_ID;
  toolbar.setAttribute("data-export-ui", "true");
  toolbar.style.cssText = "max-width:920px;margin:0 auto 28px;padding:16px;border:1px solid #e5e7eb;border-radius:16px;background:#f8f9fa;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;";

  const texto = document.createElement("div");
  texto.innerHTML = '<div style="font:600 14px Inter,Arial,sans-serif;color:#1f1f1f">Exportar análise</div><div style="margin-top:4px;font:400 12px Inter,Arial,sans-serif;color:#5f6368">Salve o diagnóstico para apresentar, compartilhar ou arquivar.</div>';

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";
  actions.append(
    criarBotao("PDF", () => exportarPdf(resultado), true),
    criarBotao("Word (.doc)", () => exportarWord(resultado)),
    criarBotao("HTML", () => exportarHtml(resultado))
  );

  toolbar.append(texto, actions);
  resultado.insertBefore(toolbar, resultado.firstChild);
}

function iniciarObservador() {
  instalarToolbar();
  const observer = new MutationObserver(() => instalarToolbar());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarObservador, { once: true });
  } else {
    iniciarObservador();
  }
}
