import { useState, useRef, useEffect, useMemo, useCallback } from "react";

/**
 * Multiselect with tag chips (collapsed), search + checkbox list (open).
 * Styling aligned with lesson editor (slate / cyan accents).
 */
export default function SnippetPackMultiselect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select snippet packs…",
  searchPlaceholder = "Search",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const labelById = useMemo(() => Object.fromEntries(options.map((o) => [o.id, o.label])), [options]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => searchRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    setSearch("");
    return undefined;
  }, [open]);

  const toggleOption = useCallback(
    (id) => {
      const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
      onChange(next);
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (e, id) => {
      e.stopPropagation();
      e.preventDefault();
      onChange(value.filter((x) => x !== id));
    },
    [value, onChange]
  );

  return (
    <div
      ref={rootRef}
      data-tour-id="monaco-snippet-pack"
      style={{ position: "relative", width: "100%", maxWidth: "min(100%, 320px)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minHeight: "38px",
          padding: "6px 10px",
          boxSizing: "border-box",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
            minWidth: 0,
            minHeight: "22px",
          }}
        >
          {value.length === 0 ? (
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{placeholder}</span>
          ) : (
            value.map((id) => (
              <span
                key={id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  maxWidth: "100%",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  fontSize: "11px",
                  color: "#334155",
                  fontWeight: 500,
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {labelById[id] || id}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeTag(e, id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      removeTag(e, id);
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    lineHeight: 1,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                  aria-label={`Remove ${labelById[id] || id}`}
                >
                  ×
                </span>
              </span>
            ))
          )}
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: "10px",
            color: "#64748b",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 4px)",
            zIndex: 12050,
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "#fff",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div
            style={{
              maxHeight: "220px",
              overflowY: "auto",
              padding: "4px 0",
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: "12px", color: "#94a3b8" }}>No matches</div>
            ) : (
              filtered.map((o) => {
                const checked = value.includes(o.id);
                return (
                  <label
                    key={o.id}
                    role="option"
                    aria-selected={checked}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      color: "#0f172a",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOption(o.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#0891b2",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, lineHeight: 1.35 }}>{o.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
