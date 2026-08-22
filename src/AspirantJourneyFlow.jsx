/**
 * Project induction + workday journey for aspirants (SVG illustration).
 * Decorative; paired with accessible text list in JsExperienceHome.
 */
export default function AspirantJourneyFlow() {
  return (
    <figure className="jxh-flow">
      <svg
        className="jxh-flow-svg"
        viewBox="0 0 1120 420"
        role="img"
        aria-labelledby="jxh-flow-title jxh-flow-desc"
      >
        <title id="jxh-flow-title">Project induction and workday journey</title>
        <desc id="jxh-flow-desc">
          Four stages: meet your team, learn the project, set up your tools, then a typical workday
          of stand-up, deep work, review, and status.
        </desc>

        <defs>
          <linearGradient id="jxhGBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d8eef3" />
            <stop offset="55%" stopColor="#e8f4f7" />
            <stop offset="100%" stopColor="#cfe6ec" />
          </linearGradient>
          <linearGradient id="jxhGRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="jxhGWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <filter id="jxhSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0c1222" floodOpacity="0.08" />
          </filter>
        </defs>

        <rect width="1120" height="420" rx="20" fill="url(#jxhGBg)" />

        {/* path spine */}
        <path
          d="M145 175 H320 M400 175 H575 M655 175 H830 M910 175 H975"
          stroke="#0e7490"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="0"
          opacity="0.35"
        />
        {[320, 575, 830].map((x) => (
          <polygon key={x} points={`${x},175 ${x - 10},168 ${x - 10},182`} fill="#0e7490" opacity="0.45" />
        ))}

        {/* ── Stage 1: Team ── */}
        <g transform="translate(40,48)" filter="url(#jxhSoft)">
          <circle cx="105" cy="128" r="118" fill="#fff" stroke="url(#jxhGRing)" strokeWidth="3.5" />
          <rect x="48" y="18" width="114" height="22" rx="11" fill="#0e7490" />
          <text x="105" y="33" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.06em">
            WELCOME
          </text>
          {/* people */}
          <g transform="translate(42,70)">
            <circle cx="28" cy="22" r="14" fill="#155e75" />
            <path d="M8 62c2-18 14-28 28-28s26 10 28 28" fill="#0e7490" opacity="0.85" />
            <circle cx="78" cy="26" r="13" fill="#fb923c" />
            <path d="M58 64c2-16 12-24 20-24s18 8 20 24" fill="#ea580c" opacity="0.9" />
            <circle cx="52" cy="48" r="11" fill="#38bdf8" />
            <path d="M36 78c1-12 8-18 16-18s15 6 16 18" fill="#0284c7" />
            {/* handshake hint */}
            <path d="M40 52h24" stroke="#0c1222" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
          </g>
          <text x="105" y="210" textAnchor="middle" fill="#0c1222" fontSize="12" fontWeight="700" fontFamily="Fraunces, Georgia, serif">
            1 · Meet the team
          </text>
          <text x="105" y="228" textAnchor="middle" fill="#3d4a63" fontSize="9.5" fontFamily="Plus Jakarta Sans, sans-serif">
            Lead · Buddy · Admin
          </text>
        </g>

        {/* ── Stage 2: Project ── */}
        <g transform="translate(295,48)" filter="url(#jxhSoft)">
          <circle cx="105" cy="128" r="118" fill="#fff" stroke="url(#jxhGRing)" strokeWidth="3.5" />
          {/* map / roadmap board */}
          <rect x="42" y="58" width="126" height="78" rx="8" fill="#e8f4f7" stroke="#0e7490" strokeWidth="1.5" />
          <circle cx="70" cy="88" r="6" fill="#0e7490" />
          <circle cx="110" cy="78" r="6" fill="#38bdf8" />
          <circle cx="145" cy="100" r="6" fill="#fb923c" />
          <path d="M70 88 L110 78 L145 100" fill="none" stroke="#155e75" strokeWidth="1.5" opacity="0.7" />
          <rect x="52" y="122" width="40" height="5" rx="2" fill="#0e7490" opacity="0.35" />
          <rect x="100" y="122" width="52" height="5" rx="2" fill="#0e7490" opacity="0.2" />
          {/* target */}
          <circle cx="160" cy="52" r="16" fill="none" stroke="url(#jxhGWarm)" strokeWidth="2.5" />
          <circle cx="160" cy="52" r="6" fill="#ea580c" />
          <text x="105" y="210" textAnchor="middle" fill="#0c1222" fontSize="12" fontWeight="700" fontFamily="Fraunces, Georgia, serif">
            2 · Project vision
          </text>
          <text x="105" y="228" textAnchor="middle" fill="#3d4a63" fontSize="9.5" fontFamily="Plus Jakarta Sans, sans-serif">
            Goals · Roadmap · Outcomes
          </text>
        </g>

        {/* ── Stage 3: Tools ── */}
        <g transform="translate(550,48)" filter="url(#jxhSoft)">
          <circle cx="105" cy="128" r="118" fill="#fff" stroke="url(#jxhGRing)" strokeWidth="3.5" />
          {/* dual monitors */}
          <rect x="38" y="68" width="58" height="42" rx="4" fill="#0c1222" />
          <rect x="42" y="72" width="50" height="30" rx="2" fill="#164e63" />
          <rect x="46" y="78" width="28" height="3" rx="1" fill="#67e8f9" opacity="0.8" />
          <rect x="46" y="85" width="20" height="3" rx="1" fill="#67e8f9" opacity="0.5" />
          <rect x="108" y="62" width="64" height="48" rx="4" fill="#0c1222" />
          <rect x="112" y="66" width="56" height="36" rx="2" fill="#155e75" />
          <text x="140" y="88" textAnchor="middle" fill="#a5f3fc" fontSize="11" fontFamily="DM Mono, monospace">{`</>`}</text>
          {/* laptop + guide */}
          <rect x="70" y="122" width="50" height="32" rx="3" fill="#334155" />
          <rect x="74" y="126" width="42" height="22" rx="2" fill="#e0f2fe" />
          <rect x="128" y="118" width="28" height="36" rx="2" fill="#fb923c" />
          <rect x="132" y="124" width="20" height="2" fill="#fff" opacity="0.7" />
          <rect x="132" y="130" width="16" height="2" fill="#fff" opacity="0.45" />
          <text x="105" y="210" textAnchor="middle" fill="#0c1222" fontSize="12" fontWeight="700" fontFamily="Fraunces, Georgia, serif">
            3 · Tools &amp; access
          </text>
          <text x="105" y="228" textAnchor="middle" fill="#3d4a63" fontSize="9.5" fontFamily="Plus Jakarta Sans, sans-serif">
            Accounts · Repo · Assist Me
          </text>
        </g>

        {/* ── Stage 4: Workday ── */}
        <g transform="translate(805,48)" filter="url(#jxhSoft)">
          <circle cx="105" cy="128" r="118" fill="#fff" stroke="url(#jxhGRing)" strokeWidth="3.5" />
          {/* table + team */}
          <ellipse cx="105" cy="118" rx="52" ry="14" fill="#e8f4f7" stroke="#0e7490" strokeWidth="1.2" />
          <circle cx="72" cy="98" r="9" fill="#155e75" />
          <circle cx="98" cy="92" r="9" fill="#0e7490" />
          <circle cx="124" cy="92" r="9" fill="#fb923c" />
          <circle cx="146" cy="100" r="9" fill="#0284c7" />
          {/* orbit badges */}
          <g fontFamily="Plus Jakarta Sans, sans-serif" fontSize="7.5" fontWeight="700" fill="#155e75">
            <rect x="28" y="48" width="58" height="16" rx="8" fill="#e8f4f7" stroke="#0e7490" />
            <text x="57" y="59" textAnchor="middle">
              STAND-UP
            </text>
            <rect x="128" y="48" width="52" height="16" rx="8" fill="#fff7ed" stroke="#ea580c" />
            <text x="154" y="59" textAnchor="middle" fill="#c2410c">
              DEEP WORK
            </text>
            <rect x="36" y="148" width="48" height="16" rx="8" fill="#e8f4f7" stroke="#0e7490" />
            <text x="60" y="159" textAnchor="middle">
              PR REVIEW
            </text>
            <rect x="118" y="148" width="58" height="16" rx="8" fill="#e8f4f7" stroke="#0e7490" />
            <text x="147" y="159" textAnchor="middle">
              EOD STATUS
            </text>
          </g>
          <text x="105" y="210" textAnchor="middle" fill="#0c1222" fontSize="12" fontWeight="700" fontFamily="Fraunces, Georgia, serif">
            4 · Your workday
          </text>
          <text x="105" y="228" textAnchor="middle" fill="#3d4a63" fontSize="9.5" fontFamily="Plus Jakarta Sans, sans-serif">
            Sync · Ship · Review · Update
          </text>
        </g>

        <text
          x="560"
          y="392"
          textAnchor="middle"
          fill="#5c6b86"
          fontSize="11"
          fontWeight="600"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="0.12em"
        >
          ASPIRANT JOURNEY · INDUCTION → WORKDAY
        </text>
      </svg>
    </figure>
  );
}
