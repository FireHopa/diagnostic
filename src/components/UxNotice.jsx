import React from "react";

function normalizeNotice(notice) {
  if (!notice) return null;
  if (typeof notice === "string") return { kind: "warning", title: "A leitura não terminou como esperado.", message: notice };
  return {
    kind: notice.kind || "warning",
    title: notice.title || "A leitura não terminou como esperado.",
    message: notice.message || "Revise os dados e tente novamente.",
    detail: notice.detail || ""
  };
}

export default function UxNotice({ notice, message, onRetry, onReturn, onDismiss }) {
  const data = normalizeNotice(notice || message);
  if (!data) return null;

  return (
    <section className="px-4 py-4 md:px-6" data-export-hide="true" role="status">
      <div className={`ux-notice ux-notice-${data.kind} mx-auto max-w-[840px]`}>
        <span className="ux-notice-icon" aria-hidden="true">{data.kind === "error" ? "×" : data.kind === "info" ? "i" : "!"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold">{data.title}</p>
          <p className="mt-1 text-[12px] leading-5">{data.message}</p>
          {data.detail ? <p className="mt-1 text-[10px] leading-4 opacity-70">{data.detail}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry ? <button type="button" onClick={onRetry} className="ux-notice-action">Tentar novamente</button> : null}
            {onReturn ? <button type="button" onClick={onReturn} className="ux-notice-action">Revisar dados</button> : null}
            {onDismiss ? <button type="button" onClick={onDismiss} className="ux-notice-dismiss">Fechar aviso</button> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
