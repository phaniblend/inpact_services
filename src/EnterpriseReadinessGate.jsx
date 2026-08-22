import InpactLogo from './components/InpactLogo.jsx'

/**
 * Fallback fork if something still lands here after the cinematic CTA — same two paths as
 * CinematicLanding: product-team experience (Apply) vs self-paced React+TS lessons.
 */
export default function EnterpriseReadinessGate({ onApply, onJustLessons }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: '620px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <InpactLogo height={72} />
        </div>

        <div
          style={{
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#64748b',
            fontWeight: 600,
            marginBottom: '10px',
          }}
        >
          Your path
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
            fontWeight: 700,
            color: '#0f172a',
            lineHeight: 1.25,
            margin: '0 0 18px',
          }}
        >
          This isn&apos;t a coding course. This is the industry.
        </h1>

        <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155', margin: '0 0 26px' }}>
          An experience builder — you join a product team, learn by doing, and ship enterprise
          software in the tech and trade you choose. Ready to continue? It&apos;s absolutely free.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onApply}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '13px 22px',
              background: '#0891b2',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.35,
            }}
          >
            Yes — take me to the experience (then Apply)
          </button>
          <button
            type="button"
            onClick={onJustLessons}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '11px 22px',
              background: 'transparent',
              color: '#0891b2',
              border: '2px solid #00d4ff',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.35,
            }}
          >
            Not yet — just teach me React with TypeScript
          </button>
        </div>
      </div>
    </div>
  )
}
