import React, { useEffect, useRef, useState } from "react";

export default function ProgressiveDisclosure({ eyebrow, title, description, defaultOpen = false, children, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);
  const innerRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? "auto" : 0);

  useEffect(() => {
    const node = innerRef.current;
    if (!node) return undefined;

    if (open) {
      setHeight(node.scrollHeight);
      const timer = window.setTimeout(() => setHeight("auto"), 360);
      return () => window.clearTimeout(timer);
    }

    if (height === "auto") {
      setHeight(node.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    } else {
      setHeight(0);
    }
    return undefined;
  }, [open]);

  return (
    <section className={`progressive-section ${open ? "is-open" : ""} ${className}`}>
      <button type="button" className="progressive-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="min-w-0 text-left">
          {eyebrow ? <span className="progressive-eyebrow">{eyebrow}</span> : null}
          <span className="progressive-title">{title}</span>
          {description ? <span className="progressive-description">{description}</span> : null}
        </span>
        <span className="progressive-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="progressive-content" style={{ height }} aria-hidden={!open}>
        <div ref={innerRef} className="progressive-content-inner">{children}</div>
      </div>
    </section>
  );
}
