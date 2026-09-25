import React from "react";

const logosIA = [
  {
    nome: "ChatGPT",
    src: "/brands/chatgpt.png",
    imgClassName: "h-4 w-4"
  },
  {
    nome: "Gemini",
    src: "/brands/gemini.png",
    imgClassName: "h-4 w-4"
  },
  {
    nome: "Google",
    src: "/brands/google-g.png",
    imgClassName: "h-4 w-4"
  }
];

export default function AiBrandLogos({ centered = false, large = false, className = "" }) {
  const wrapperClass = large
    ? "gap-2.5"
    : "gap-1.5";

  const itemClass = large
    ? "h-10 w-10 rounded-xl"
    : "h-8 w-8 rounded-lg";

  const imgClass = large
    ? "h-5 w-5"
    : "h-4 w-4";

  return (
    <div
      className={`${centered ? "justify-center" : "justify-start"} flex items-center ${wrapperClass} ${className}`.trim()}
      aria-label="Inteligências Artificiais analisadas"
    >
      {logosIA.map((logo) => (
        <span
          key={logo.nome}
          className={`flex items-center justify-center border border-line bg-white shadow-sm ${itemClass}`}
          title={logo.nome}
        >
          <img src={logo.src} alt={logo.nome} className={`${imgClass} object-contain`} />
        </span>
      ))}
    </div>
  );
}
