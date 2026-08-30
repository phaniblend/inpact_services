import { useState } from "react";

/**
 * Renders a task's "design mock" — a small interactive preview of the screen a task asks for
 * (list + form, or an API request/response pair), driven by a plain JSON config
 * (write-smb-assist-engines.mjs writes one per Coding task's Assist module, embedded as
 * NODES[0].content.designMock in the generated engine file — see designMocks.generated.js for
 * the same data extracted into a lightweight, engine-independent map).
 *
 * Originally lived only inside the Assist Me lesson engine (inpact_engine_shared.jsx) as
 * LessonDesignMock/LiveListFormDesignMock — extracted here, unchanged, so Workbench's "Try the
 * mock" modal can render the identical preview without pulling in the whole lesson-engine bundle
 * just to show a task's screen before someone has even started the lesson.
 */

const MOCK_SHELL = {
  fontFamily: "Segoe UI, system-ui, sans-serif",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};
const MOCK_CHROME = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};
const MOCK_DOT = { width: 8, height: 8, borderRadius: "50%", background: "#cbd5e1", display: "inline-block" };

export default function DesignMockPreview({ mock }) {
  if (!mock || typeof mock !== "object") return null;
  const kind = mock.kind || "list-and-form";
  const caption = mock.caption || "This is the screen you are building. Match the pieces — not the brand colors.";

  if (String(kind).includes("api")) {
    const getSample = mock.getSample || "";
    const postSample = mock.postSample || "";
    return (
      <div style={{ margin: "0 0 28px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 800, color: "#64748b", marginBottom: 8 }}>DESIGN MOCK</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <div style={MOCK_SHELL}>
            <div style={MOCK_CHROME}>
              <span style={MOCK_DOT} /><span style={MOCK_DOT} /><span style={MOCK_DOT} />
              <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>{mock.getLabel || "GET"}</span>
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 11, lineHeight: 1.45, color: "#0f172a", whiteSpace: "pre-wrap" }}>{getSample}</pre>
          </div>
          <div style={MOCK_SHELL}>
            <div style={MOCK_CHROME}>
              <span style={MOCK_DOT} /><span style={MOCK_DOT} /><span style={MOCK_DOT} />
              <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>{mock.postLabel || "POST"}</span>
            </div>
            <pre style={{ margin: 0, padding: 12, fontSize: 11, lineHeight: 1.45, color: "#0f172a", whiteSpace: "pre-wrap" }}>{postSample}</pre>
          </div>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{caption}</p>
      </div>
    );
  }

  return <LiveListFormDesignMock mock={mock} caption={caption} />;
}

function rowFromFormValues(fields, values) {
  const by = {};
  fields.forEach((field, i) => {
    by[String(field.label || "").toLowerCase()] = String(values[i] || "").trim();
  });
  // "client" checked first: booking's own mock is the only one with "provider" and no "client"
  // field, so checking service/provider first (the original order) mislabeled every other mock
  // that happens to also have a "service" field alongside "client" — found live testing the
  // package-low-board mock, which showed the service value as the row's bold title instead of
  // the client name.
  if (by.client) {
    return { title: by.client, subtitle: by.service || by.amount, meta: by["due date"] || by.duedate || by["starts at"] || by.startsat || values[2] };
  }
  if (by.service || by.provider) {
    return { title: by.service || values[1], subtitle: by.provider || values[0], meta: by["starts at"] || by.startsat || values[2] };
  }
  return { title: values[0] || "", subtitle: values[1] || "", meta: values[2] || "" };
}

function LiveListFormDesignMock({ mock, caption }) {
  const sampleRows = Array.isArray(mock.rows) ? mock.rows : [];
  const fields = Array.isArray(mock.fields) ? mock.fields : [];
  const [rows, setRows] = useState(sampleRows);
  const [values, setValues] = useState(() => fields.map(() => ""));

  function onSubmit(e) {
    e.preventDefault();
    if (values.every((v) => !String(v).trim())) return;
    setRows((prev) => [...prev, rowFromFormValues(fields, values)]);
    setValues(fields.map(() => ""));
  }

  return (
    <div style={{ margin: "0 0 28px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", fontWeight: 800, color: "#64748b", marginBottom: 8 }}>DESIGN MOCK — try it</div>
      <div style={{ ...MOCK_SHELL, maxWidth: 560 }}>
        <div style={MOCK_CHROME}>
          <span style={{ ...MOCK_DOT, background: "#f43f5e" }} />
          <span style={{ ...MOCK_DOT, background: "#f59e0b" }} />
          <span style={{ ...MOCK_DOT, background: "#22c55e" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginLeft: 8 }}>{mock.screenTitle || "App"}</span>
        </div>
        <div style={{ padding: 14, display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "#64748b", marginBottom: 6 }}>{mock.listCaption || "LIST"}</div>
            {rows.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #cbd5e1",
                  borderRadius: 8,
                  padding: "16px 12px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#64748b",
                  background: "#f8fafc",
                }}
              >
                {mock.emptyMessage || "Nothing here yet."}
              </div>
            ) : (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                {rows.map((row, i) => (
                  <div
                    key={`${row.title}-${row.subtitle}-${row.meta}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 12px",
                      borderTop: i ? "1px solid #f1f5f9" : "none",
                      background: "#fff",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{row.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{row.subtitle}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", whiteSpace: "nowrap" }}>{row.meta}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", color: "#64748b" }}>FORM</div>
            {fields.map((field, i) => (
              <label key={field.label} style={{ display: "grid", gap: 4, fontSize: 11, color: "#475569" }}>
                {field.label}
                <input
                  value={values[i] || ""}
                  placeholder={field.sample || ""}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = e.target.value;
                    setValues(next);
                  }}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 13,
                    color: "#0f172a",
                    background: "#fff",
                    fontFamily: "inherit",
                  }}
                />
              </label>
            ))}
            <button
              type="submit"
              style={{
                marginTop: 4,
                justifySelf: "start",
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#0891b2",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {mock.submitLabel || "Submit"}
            </button>
          </form>
        </div>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
        {caption} Type in the boxes and click {mock.submitLabel || "Submit"} — a new row should appear. The empty message shows when the list has no rows.
      </p>
    </div>
  );
}
