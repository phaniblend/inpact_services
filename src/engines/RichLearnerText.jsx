import { createElement } from "react";
import { highlightFencedCode } from "./inpactHighlight.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * SVG strings from JSON often reuse ids (e.g. #arrowhead). Multiple <svg> in one document
 * would duplicate ids and break markers — prefix each element's ids + url(#…) refs.
 */
function uniquifySvgElementIds(svgMarkup, uniqueSuffix) {
  const idPattern = /\bid\s*=\s*(["'])([^"']+)\1/gi;
  const ids = new Set();
  let m;
  idPattern.lastIndex = 0;
  while ((m = idPattern.exec(svgMarkup)) !== null) {
    ids.add(m[2]);
  }
  const sorted = [...ids].sort((a, b) => b.length - a.length);
  let out = svgMarkup;
  for (const oldId of sorted) {
    const newId = `inpact-${uniqueSuffix}-${oldId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    out = out.replace(new RegExp(`\\bid\\s*=\\s*(["'])${escapeRegex(oldId)}\\1`, "gi"), `id="${newId}"`);
    out = out.replace(new RegExp(`url\\(#${escapeRegex(oldId)}\\)`, "g"), `url(#${newId})`);
  }
  return out;
}

/**
 * Renders lesson copy that authors write with lightweight markdown-style markers:
 * - **emphasis** → <strong>
 * - `inline code` → <code>
 * Code spans are parsed first, then bold runs inside each text segment (so **`()`** works).
 */

function parseBoldSegments(fragment, keyRef) {
  const out = [];
  let pos = 0;
  const B = "**";
  while (pos < fragment.length) {
    const open = fragment.indexOf(B, pos);
    if (open === -1) {
      if (pos < fragment.length) out.push(fragment.slice(pos));
      break;
    }
    if (open > pos) out.push(fragment.slice(pos, open));
    const close = fragment.indexOf(B, open + 2);
    if (close === -1) {
      out.push(fragment.slice(open));
      break;
    }
    out.push(
      createElement(
        "strong",
        { key: `inpact-rs-${keyRef.n++}`, className: "inpact-rich-strong" },
        fragment.slice(open + 2, close)
      )
    );
    pos = close + 2;
  }
  return out;
}

/**
 * @param {string} text
 * @param {{ n: number }} [keyRef] shared key counter when composing with block mode
 * @returns {import("react").ReactNode[]}
 */
function richLearnerTextToNodes(text, keyRef) {
  const kr = keyRef ?? { n: 0 };
  if (typeof text !== "string" || !text) return [];
  const result = [];
  let i = 0;
  while (i < text.length) {
    const bt = text.indexOf("`", i);
    if (bt === -1) {
      result.push(...parseBoldSegments(text.slice(i), kr));
      break;
    }
    if (bt > i) result.push(...parseBoldSegments(text.slice(i, bt), kr));
    const end = text.indexOf("`", bt + 1);
    if (end === -1) {
      result.push(text.slice(bt));
      break;
    }
    result.push(
      createElement(
        "code",
        { key: `inpact-rc-${kr.n++}`, className: "inpact-rich-code" },
        text.slice(bt + 1, end)
      )
    );
    i = end + 1;
  }
  return result;
}

/** @returns {{ type: 'text' | 'code', lang?: string, value: string }[]} */
function splitFencedCode(text) {
  const re = /```(\w*)\r?\n([\s\S]*?)```/g;
  const segments = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "text", value: text.slice(last, m.index) });
    segments.push({ type: "code", lang: m[1] || "text", value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  if (segments.length === 0) segments.push({ type: "text", value: text });
  return segments;
}

/** @returns {{ type: 'text' | 'img', value?: string, alt?: string, src?: string }[]} */
function splitMarkdownImages(text) {
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const segments = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "text", value: text.slice(last, m.index) });
    segments.push({ type: "img", alt: m[1], src: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  if (segments.length === 0) segments.push({ type: "text", value: text });
  return segments;
}

/** @returns {{ type: 'text' | 'svg', value: string }[]} */
function splitSvgSegments(text) {
  const segments = [];
  let rest = text;
  while (rest.length) {
    const lower = rest.toLowerCase();
    const start = lower.indexOf("<svg");
    if (start === -1) {
      segments.push({ type: "text", value: rest });
      break;
    }
    if (start > 0) segments.push({ type: "text", value: rest.slice(0, start) });
    const endTag = "</svg>";
    const end = lower.indexOf(endTag, start);
    if (end === -1) {
      segments.push({ type: "text", value: rest.slice(start) });
      break;
    }
    segments.push({ type: "svg", value: rest.slice(start, end + endTag.length) });
    rest = rest.slice(end + endTag.length);
  }
  if (segments.length === 0 && text) segments.push({ type: "text", value: text });
  return segments;
}

/**
 * Trusted author content: fenced ``` blocks, ![alt](url), inline <svg>…</svg>, then ** / `.
 * @param {string} text
 * @returns {import("react").ReactNode[]}
 */
function richBlocksToNodes(text) {
  if (typeof text !== "string" || !text) return [];
  const keyRef = { n: 0 };
  const nodes = [];

  function fragmentToNodes(fragment) {
    const out = [];
    for (const seg of splitMarkdownImages(fragment)) {
      if (seg.type === "img") {
        out.push(
          createElement("img", {
            key: `inpact-rimg-${keyRef.n++}`,
            src: seg.src,
            alt: seg.alt || "",
            className: "inpact-rich-img",
            style: {
              maxWidth: "100%",
              height: "auto",
              display: "block",
              marginTop: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            },
          })
        );
      } else {
        for (const svgSeg of splitSvgSegments(seg.value || "")) {
          if (svgSeg.type === "svg") {
            const svgKey = keyRef.n++;
            const safeSvg = uniquifySvgElementIds(svgSeg.value, `dd${svgKey}`);
            out.push(
              createElement("span", {
                key: `inpact-rsvg-${svgKey}`,
                className: "inpact-rich-svg-wrap",
                style: { display: "block", maxWidth: "100%", margin: "10px 0" },
                dangerouslySetInnerHTML: { __html: safeSvg },
              })
            );
          } else if (svgSeg.value) {
            out.push(...richLearnerTextToNodes(svgSeg.value, keyRef));
          }
        }
      }
    }
    return out;
  }

  for (const part of splitFencedCode(text)) {
    if (part.type === "code") {
      const preKey = keyRef.n++;
      const html = highlightFencedCode(part.lang, part.value);
      nodes.push(
        createElement(
          "pre",
          {
            key: `inpact-rpre-${preKey}`,
            className: "inpact-rich-pre inpact-rich-pre--hljs",
          },
          createElement("code", {
            className: "hljs",
            dangerouslySetInnerHTML: { __html: html },
          })
        )
      );
    } else if (part.value) {
      nodes.push(...fragmentToNodes(part.value));
    }
  }
  return nodes;
}

/**
 * @param {{
 *   text: string,
 *   style?: import("react").CSSProperties,
 *   className?: string,
 *   as?: "div" | "span",
 *   variant?: "default" | "task" | "taskCallout" | "hint" | "feedback" | "muted",
 *   contentMode?: "inline" | "blocks",
 * }} props
 *
 * **contentMode="blocks"** — fenced ``` code, `![alt](url)` images, raw `<svg>…</svg>` (trusted), then inline ** / `.
 */
export default function RichLearnerText({ text, style, className = "", as = "div", variant = "default", contentMode = "inline" }) {
  if (text == null || text === "") return null;
  const nodes = contentMode === "blocks" ? richBlocksToNodes(String(text)) : richLearnerTextToNodes(String(text));
  const v = variant !== "default" ? ` inpact-rich--${variant}` : "";
  return createElement(as, { style, className: `inpact-rich-text${v} ${className}`.trim() }, ...nodes);
}
