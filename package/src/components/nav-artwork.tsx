export default function NavArtwork({
  kind,
}: {
  kind: "promo" | "story";
}) {
  if (kind === "story")
    return (
      <span
        className="nav-artwork nav-story"
        aria-hidden="true"
      >
        <span className="nav-story-words">
          <span>Dapur</span>
          <span>
            FoodStore
            <span className="nav-story-dot">.</span>
          </span>
        </span>
        {kind === "story" && (
          <svg className="nav-story-spark" viewBox="0 0 24 30" fill="none">
            <path d="m12 1 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" fill="#ffc145" />
            <path d="m18 23 1 3 3 1-3 1-1 2-1-2-3-1 3-1 1-3Z" fill="#e86b25" />
          </svg>
        )}
      </span>
    );
  return (
    <span className="nav-artwork nav-deals" aria-hidden="true">
      <svg className="nav-deals-illustration" viewBox="0 0 58 66" fill="none">
        <path
          d="m23 64-8-19-5-8c-3-5 1-8 4-5l6 5-2-22c0-4 5-5 6-1l4 19 9-3 10 16 8 18H23Z"
          fill="#f2b78e"
        />
        <path d="m32 40 5-6c2-3 6-1 5 2l-3 12" fill="#fac9a3" />
        <g transform="rotate(-10 23 27)">
          <rect x="10" y="3" width="29" height="47" rx="5" fill="#6d635b" />
          <rect x="12" y="5" width="25" height="43" rx="3" fill="#fff9ed" />
          <path
            d="M21 7h6"
            stroke="#b2a496"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17 27h15a7.5 7.5 0 0 1-15 0ZM21 20v3m4-5v5m4-3v3"
            stroke="#ed6a24"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="25" cy="41" r="2" fill="#f8bd61" />
        </g>
        <path
          d="m44 5 4-3m-1 11h6M4 17l-3-3"
          stroke="#ffb62f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="nav-deals-words">
        <span>BANYAK</span>
        <span>HEMATNYA!</span>
      </span>
    </span>
  );
}
