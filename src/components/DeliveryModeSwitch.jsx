import React from "react";

const modos = [
  { value: "completo", label: "Completa", descricao: "Detalhes, evidências e aprofundamentos." },
  { value: "simplificado", label: "Simplificada", descricao: "Direta, visual e sem plano de ação." }
];

export default function DeliveryModeSwitch({ value = "completo", onChange, compact = false, disabled = false }) {
  return (
    <section className={compact ? "mb-5" : "px-4 pb-2 pt-2 md:px-6"} data-export-hide="true" aria-label="Formato de entrega">
      <div className={compact ? "" : "mx-auto max-w-[780px]"}>
        <div className={`delivery-switch-shell ${compact ? "is-compact" : ""}`}>
          {!compact ? <div className="delivery-switch-copy"><p>Formato da entrega</p><span>A análise é a mesma. Só muda a forma de apresentar.</span></div> : null}
          <div className="delivery-switch-tabs">
            <span className={`delivery-switch-slider ${value === "simplificado" ? "is-right" : ""}`} aria-hidden="true" />
            {modos.map((modo) => (
              <button key={modo.value} type="button" onClick={() => onChange?.(modo.value)} disabled={disabled} className={value === modo.value ? "is-active" : ""}>
                <strong>{modo.label}</strong>
                {!compact ? <small>{modo.descricao}</small> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
