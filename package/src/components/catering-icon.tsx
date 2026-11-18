// FoodStore's project-native vector illustrations. No external icon assets.
export type CateringIconKind =
  "rice" | "kebuli" | "snack" | "birthday" | "budget" | "family" | "store" | "schedule";

export default function CateringIcon({ kind }: { kind: CateringIconKind }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="108" height="108" rx="30" fill="#fff0df" />
      <g
        stroke="#31484b"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === "store" && (
          <>
            <path d="M23 94h74" stroke="#d7a77f" />
            <path d="M29 48h62v43H29z" fill="#fffaf0" />
            <path d="m24 46 8-22h56l8 22" fill="#f5c79f" />
            <path d="M24 46h18v5c0 12-18 12-18 0v-5Zm36 0h18v5c0 12-18 12-18 0v-5Z" fill="#ed7d49" />
            <path d="M42 46h18v5c0 12-18 12-18 0v-5Zm36 0h18v5c0 12-18 12-18 0v-5Z" fill="#fff4df" />
            <path d="M39 70h19v21H39z" fill="#f6d27f" />
            <rect x="67" y="67" width="15" height="14" rx="3" fill="#9eb08a" />
            <path d="M53 81v3m19-10h5" stroke="#ac7755" />
            <path d="M85 20c-18-12-12-25 0-25s18 13 0 25Z" transform="translate(0 13)" fill="#e96d2e" />
            <circle cx="85" cy="13" r="4" fill="#fff3df" stroke="none" />
            <path d="m18 32-4-3m6-6-1-5" stroke="#dc9a61" />
          </>
        )}
        {kind === "schedule" && (
          <>
            <rect x="24" y="27" width="67" height="65" rx="11" fill="#fffaf0" />
            <path d="M24 47V38a11 11 0 0 1 11-11h45a11 11 0 0 1 11 11v9H24Z" fill="#ed7d49" />
            <path d="M41 19v15m33-15v15" stroke="#778c68" strokeWidth="5" />
            <path d="M37 59h7m9 0h7m-23 12h7m9 0h7m-23 12h7" stroke="#d7a77f" strokeWidth="3" />
            <circle cx="82" cy="79" r="20" fill="#f6d27f" />
            <circle cx="82" cy="79" r="14" fill="#fff8e8" stroke="#c48d4d" strokeWidth="1.8" />
            <path d="M82 70v10l7 4" stroke="#e96d2e" strokeWidth="3" />
            <path d="M30 99h35m33-76 4-4m-2 13 6-1" stroke="#dc9a61" />
          </>
        )}
        {kind === "rice" && (
          <>
            <ellipse cx="60" cy="86" rx="40" ry="12" fill="#f7c9a2" />
            <path d="M23 84c7 12 65 12 74 0" stroke="#d78651" />
            <path d="m60 29 24 51c-11 8-36 8-48 0l24-51Z" fill="#f5b943" />
            <path d="m60 29 8 17c-4 3-12 3-16 0l8-17Z" fill="#778c68" />
            <path d="m48 68 3-1m10 5 3-1m-7-14 2-1m8 9 2 1" stroke="#ce8b23" />
            <path d="M27 76c-9-7-5-15 4-14 8 2 8 12 3 16" fill="#eb8450" />
            <path d="M86 67c8-7 17 0 10 10l-10 4" fill="#e86b25" />
            <path d="m30 43-4-5m61 7 5-5" stroke="#dc9a61" />
            <path
              d="M51 17c-5 4 5 5 0 10m15-11c-5 4 5 5 0 10"
              stroke="#d4a581"
            />
          </>
        )}
        {kind === "kebuli" && (
          <>
            <path d="M24 61c1-23 70-23 72 0" fill="#f5cf7d" />
            <path d="M22 60h76L87 86c-10 9-44 9-54 0L22 60Z" fill="#e87942" />
            <path d="M31 70h58M44 95h32" stroke="#b66037" />
            <path d="m39 48 3-1m9 4 3-2m23 1 3-1m-19 5 3-1" stroke="#b49550" />
            <path
              d="M56 38c-6-13 15-19 21-7 5 10-3 19-13 16l-8 6-7-7 7-8Z"
              fill="#bd754d"
            />
            <path d="m49 46-7 7m-2-3 5 6" stroke="#fff7e7" strokeWidth="4" />
            <path d="m70 30 4 5m-10-2 4 6" stroke="#8d533a" />
            <path d="m86 33 5-7m-2 13 8-2" stroke="#d9965a" />
            <path d="M31 27c-4 4 4 6 0 10" stroke="#d4a581" />
          </>
        )}
        {kind === "snack" && (
          <>
            <path d="m25 48 8-22h54l8 22" fill="#f5c79f" />
            <path d="m25 48 9 42h52l9-42H25Z" fill="#fff9ef" />
            <path
              d="m25 48-8 10 10 25 7-4m61-31 8 10-10 25-7-4"
              fill="#e88a56"
            />
            <path d="M31 52c-1-17 24-21 28-4" fill="#f4bd67" />
            <path d="m38 43 4 7m5-9 5 7" stroke="#c98a43" />
            <rect
              x="62"
              y="38"
              width="20"
              height="25"
              rx="6"
              fill="#8ea383"
              transform="rotate(16 72 50)"
            />
            <path d="m67 44 11 3m-13 5 11 3" stroke="#c7d5b5" />
            <path d="M27 60c16-6 47-5 66 0" />
            <path d="M46 71h28v17H46z" fill="#ed6b25" stroke="none" />
            <path d="M52 77h16m-12 5h8" stroke="#fff4df" />
            <path d="m45 18 1-5m13 5 3-4" stroke="#d9965a" />
          </>
        )}
        {kind === "birthday" && (
          <>
            <path d="M22 94h76M32 99h56" />
            <rect x="30" y="56" width="60" height="35" rx="6" fill="#f2b992" />
            <path
              d="M30 63c6 8 13-4 19 1 7 8 12-5 19 0 8 8 15-5 22 0v-4a4 4 0 0 0-4-4H34a4 4 0 0 0-4 4v3Z"
              fill="#fffaf0"
            />
            <path d="M40 54V41h40v13" fill="#ed7d49" />
            <path
              d="M48 40V30m12 10V27m12 13V30"
              stroke="#758a7d"
              strokeWidth="3"
            />
            <path
              d="M48 25c-7-5 0-13 0-13s7 8 0 13Zm12-3c-7-5 0-13 0-13s7 8 0 13Zm12 3c-7-5 0-13 0-13s7 8 0 13Z"
              fill="#f6b73b"
              stroke="none"
            />
            <path d="m43 79 2-2m12 7 2-2m12-5 2-2m8 9 2-2" stroke="#c58061" />
            <path d="m18 40 2 4m82-10-3 4m1 20 5-1" stroke="#dc9a61" />
          </>
        )}
        {kind === "budget" && (
          <>
            <rect x="23" y="37" width="73" height="55" rx="12" fill="#fffaf1" />
            <rect
              x="30"
              y="45"
              width="34"
              height="39"
              rx="7"
              fill="#f6d27f"
              stroke="none"
            />
            <path d="M35 68c1-18 22-18 24 0H35Z" fill="#fffdf4" />
            <path d="m39 75 3 1m8-1 3-1" stroke="#c59b49" />
            <rect
              x="71"
              y="46"
              width="17"
              height="15"
              rx="5"
              fill="#9eb08a"
              stroke="none"
            />
            <path d="m73 72 6 8 8-10" stroke="#df7544" strokeWidth="5" />
            <path d="m38 36 15-17h36l8 9-8 9H53" fill="#e96d2e" />
            <circle cx="87" cy="28" r="2" fill="#ffe4c2" stroke="none" />
            <path d="M42 28h-8c-10 0-12 6-8 13" stroke="#c89a71" />
            <text
              x="68"
              y="32"
              textAnchor="middle"
              fontFamily="Arial,sans-serif"
              fontSize="12"
              fontWeight="800"
              fill="#fffaf2"
              stroke="none"
            >
              25K
            </text>
            <path d="M34 99h51" stroke="#d7a77f" />
          </>
        )}
        {kind === "family" && (
          <>
            <ellipse cx="60" cy="67" rx="39" ry="22" fill="#f5c79f" />
            <path d="M28 76v19m64-19v19M32 85h56" stroke="#ac7755" />
            <ellipse cx="60" cy="64" rx="14" ry="9" fill="#fffaf0" />
            <path d="m60 51 8 14H52l8-14Z" fill="#f2b943" />
            <path d="M31 53h18c0 13-18 13-18 0Z" fill="#e67d49" />
            <path d="M73 53h18c0 13-18 13-18 0Z" fill="#8ca184" />
            <path d="M44 75h19c-2 11-18 10-19 0Z" fill="#e67d49" />
            <path d="m72 77 11-3m-10 8 11-3" stroke="#fff7e5" />
            <path
              d="M60 38c-19-11-13-24-4-22l4 4 4-4c10-2 15 11-4 22Z"
              fill="#ed6b25"
              stroke="none"
            />
            <path d="m31 30 4 6m53-6-4 6" stroke="#d9965a" />
          </>
        )}
      </g>
    </svg>
  );
}
