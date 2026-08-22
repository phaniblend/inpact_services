import logoSvg from "../assets/logo.svg";

/**
 * Brand mark — use wherever the UI previously showed the “INPACT” wordmark.
 * @param {number|string} [height] — CSS height (number → px)
 */
export default function InpactLogo({ height = 120, style, className, alt = "INPACT" }) {
  const h = typeof height === "number" ? `${height}px` : height;
  return (
    <img
      src={logoSvg}
      alt={alt}
      className={className}
      decoding="async"
      draggable={false}
      style={{
        height: h,
        width: "auto",
        maxWidth: "100%",
        display: "block",
        objectFit: "contain",
        ...style,
      }}
    />
  );
}
