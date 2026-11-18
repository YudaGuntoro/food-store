import type { CSSProperties } from "react";
const paths = {
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM17.5 6.5h.01",
  tiktok: "M14 3h3a5 5 0 0 0 4 5v3a8 8 0 0 1-4-1v7a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V3Z",
  mail: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
  whatsapp: "M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.8A8.5 8.5 0 1 1 20.5 11.5ZM8 7l2 3-1 1a9 9 0 0 0 4 3l1-2 3 2c-1 4-9 1-10-4 0-1 0-2 1-3Z",
  phone:
    "M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z",
  bag: "M6 7h12l2 14H4L6 7ZM9 8V6a3 3 0 0 1 6 0v2",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  leaf: "M20 3C7 3 2 9 5 16s17 6 15-13ZM3 22 15 10",
  truck:
    "M1 4h14v13H1V4ZM15 9h4l4 5v3h-8M8 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  clock: "M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  chat: "M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.8-5A9 9 0 1 1 21 11ZM8 11h8M8 7h5",
  bowl: "M3 12h18a9 9 0 0 1-18 0ZM8 21h8M8 3v4m4-5v5m4-4v4",
  check: "m5 12 4 4L19 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 21v-2a4 4 0 0 0-3-4M17 3a4 4 0 0 1 0 8",
  pin: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z",
};
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  size = 22,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
