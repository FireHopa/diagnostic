const LOGO_URL = "/brand/logo-casa-do-ads.png";

function slugify(value = "diagnostico-ia") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "diagnostico-ia";
}

function dataHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function nomeArquivoDiagnostico({ empresa = "", tipo = "diagnostico" } = {}) {
  const nomeEmpresa = slugify(empresa || "empresa");
  const nomeTipo = tipo === "reputacao" ? "reputacao" : "autoridade";
  return `diagnostico-ia-${nomeTipo}-${nomeEmpresa}-${dataHoje()}`;
}

function escaparHtml(value = "") {
  return value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baixarBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function abrirDetailsTemporariamente(root) {
  const details = Array.from(root.querySelectorAll("details"));
  const estados = details.map((item) => item.open);
  details.forEach((item) => {
    item.open = true;
  });

  return () => {
    details.forEach((item, index) => {
      item.open = estados[index];
    });
  };
}

function coletarCssDaPagina() {
  let css = "";

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules || [])) {
        css += `${rule.cssText}\n`;
      }
    } catch {
      // Folhas externas, como Google Fonts, podem bloquear leitura por CORS.
    }
  }

  return css;
}

async function arquivoParaDataUrl(url) {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return "";
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function limparClone(root) {
  const clone = root.cloneNode(true);

  clone.querySelectorAll('[data-export-hide="true"]').forEach((node) => node.remove());
  clone.querySelectorAll("details").forEach((details) => {
    details.setAttribute("open", "");
  });
  clone.querySelectorAll("button").forEach((button) => button.remove());

  return clone;
}

async function montarDocumentoHtml({ root, titulo, empresa, subtitulo = "" }) {
  const clone = limparClone(root);
  const logo = await arquivoParaDataUrl(LOGO_URL);
  const cssPagina = coletarCssDaPagina();
  const nomeEmpresa = empresa || "Empresa analisada";
  const tituloSeguro = escaparHtml(titulo || "Diagnóstico com Inteligência Artificial");
  const empresaSegura = escaparHtml(nomeEmpresa);
  const subtituloSeguro = escaparHtml(subtitulo);

  clone.querySelectorAll(".export-document-brand").forEach((brand) => {
    brand.style.display = "flex";
  });

  if (logo) {
    clone.querySelectorAll('[data-export-logo="true"]').forEach((img) => {
      img.setAttribute("src", logo);
    });
  }

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${tituloSeguro}</title>
<style>
${cssPagina}
html, body { background: #fff !important; color: #1f1f1f; }
body { margin: 0; padding: 28px; font-family: Inter, Arial, sans-serif; }
#resultado { padding: 0 !important; }
.export-document-brand { display: flex !important; align-items: center; gap: 18px; padding-bottom: 22px; margin-bottom: 28px; border-bottom: 1px solid #e5e7eb; }
.export-document-brand img { width: 62px; height: auto; object-fit: contain; }
.export-document-brand h1 { margin: 0; font-size: 22px; line-height: 1.2; color: #1f1f1f; }
.export-document-brand p { margin: 5px 0 0; font-size: 12px; line-height: 1.5; color: #6b7280; }
[data-export-hide="true"] { display: none !important; }
details { display: block !important; }
details > * { display: block !important; }
summary { list-style: none; }
a { color: #1a73e8; text-decoration: none; word-break: break-word; }
@page { size: A4; margin: 14mm; }
@media print { body { padding: 0; } }
</style>
</head>
<body>
${clone.outerHTML}
<footer style="margin-top:36px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;line-height:1.5;color:#9ca3af;">
Diagnóstico com Inteligência Artificial · Casa do Ads · ${empresaSegura}${subtituloSeguro ? ` · ${subtituloSeguro}` : ""}
</footer>
</body>
</html>`;
}

export function exportarComoPdf({ rootId = "resultado", filename }) {
  const root = document.getElementById(rootId);
  if (!root) throw new Error("Resultado da análise não encontrado para exportação.");

  const restaurarDetails = abrirDetailsTemporariamente(root);
  const tituloAnterior = document.title;
  document.title = filename || "diagnostico-ia";
  document.body.classList.add("exportando-diagnostico");

  let finalizado = false;
  const restaurar = () => {
    if (finalizado) return;
    finalizado = true;
    document.body.classList.remove("exportando-diagnostico");
    document.title = tituloAnterior;
    restaurarDetails();
    window.removeEventListener("afterprint", restaurar);
  };

  window.addEventListener("afterprint", restaurar);
  window.setTimeout(() => {
    window.print();
    window.setTimeout(restaurar, 1000);
  }, 120);
}

export async function exportarComoWord({ rootId = "resultado", filename, titulo, empresa, subtitulo }) {
  const root = document.getElementById(rootId);
  if (!root) throw new Error("Resultado da análise não encontrado para exportação.");

  const html = await montarDocumentoHtml({ root, titulo, empresa, subtitulo });
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  baixarBlob(blob, `${filename}.doc`);
}

export async function exportarComoHtml({ rootId = "resultado", filename, titulo, empresa, subtitulo }) {
  const root = document.getElementById(rootId);
  if (!root) throw new Error("Resultado da análise não encontrado para exportação.");

  const html = await montarDocumentoHtml({ root, titulo, empresa, subtitulo });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  baixarBlob(blob, `${filename}.html`);
}
