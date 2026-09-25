import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white px-4 py-7 md:px-6" data-export-hide="true">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <img src="/brand/logo-casa-do-ads.png" alt="Casa do Ads" className="h-10 w-auto object-contain" />
        <p className="text-[11px] leading-5 text-gray-400">Autoridade e presença digital</p>
      </div>
    </footer>
  );
}
