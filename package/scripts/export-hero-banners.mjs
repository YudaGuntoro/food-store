// Export code-designed banners as complete raster images, including typography.
// Run from package/: node scripts/export-hero-banners.mjs
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const directory = path.join(root, "public/images/banners");
await mkdir(directory, { recursive: true });
const font = (
  await readFile(path.join(root, "public/fonts/amatic-sc-bold.ttf"))
).toString("base64");
const designs = [
  {
    file: "momen",
    image: "tumpeng",
    eyebrow: "DARI DAPUR, DENGAN SEPENUH HATI",
    first: "Setiap momen,",
    second: "jadi lebih",
    accent: "nikmat.",
    description:
      "Dari makan siang sampai hari istimewa. Temukan hidangan Nusantara untuk dinikmati sendiri, atau dibagi bersama.",
    button: "Jelajahi menu",
    background: "#f3f3f1",
  },
  {
    file: "kebuli",
    image: "kebuli",
    eyebrow: "AROMA REMPAH, RASA NUSANTARA",
    first: "Kaya rempah,",
    second: "penuh",
    accent: "cerita.",
    description:
      "Nasi kebuli dan ayam rempah untuk melengkapi meja makan. Nikmati sendiri atau berbagi bersama orang terdekat.",
    button: "Lihat nasi kebuli",
    background: "#f3f0e9",
  },
  {
    file: "nasi-box",
    image: "nasi-box",
    eyebrow: "PILIHAN PRAKTIS UNTUK ACARAMU",
    first: "Acara ramai,",
    second: "budget tetap",
    accent: "santai.",
    description:
      "Satu kotak penuh rasa rumahan. Pilihan nasi box untuk rapat, kumpul keluarga, dan momen kebersamaan.",
    button: "Lihat paket nasi box",
    background: "#fff2e7",
  },
];
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const design of designs) {
    const photo = (
      await readFile(path.join(root, `public/images/food/${design.image}.webp`))
    ).toString("base64");
    for (const mobile of [false, true]) {
      const page = await browser.newPage({
        viewport: { width: mobile ? 390 : 1600, height: mobile ? 730 : 610 },
        deviceScaleFactor: mobile ? 2 : 1,
      });
      await page.setContent(`<!doctype html><html lang="id"><head><meta charset="utf-8"><style>
        @font-face{font-family:Amatic;src:url(data:font/ttf;base64,${font}) format('truetype');font-weight:700}
        *{box-sizing:border-box}body{margin:0;background:${design.background};color:#37332f;font-family:Arial,Helvetica,sans-serif}
        main{width:1240px;max-width:calc(100% - 96px);height:610px;margin:auto;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:80px}
        .copy{max-width:490px}.eyebrow{font-size:9px;letter-spacing:1.8px;color:#8b7665;font-weight:600;display:flex;align-items:center;gap:8px;margin-bottom:22px}.eyebrow:before{content:'';width:5px;height:5px;border-radius:50%;background:#e86723}
        h1{font:700 76px/1.12 Amatic,cursive;letter-spacing:.4px;margin:0 0 24px}h1 span{color:#e86723}p{font-size:15px;line-height:1.8;color:#77736f;max-width:445px;margin:0}
        .actions{display:flex;gap:25px;align-items:center;margin-top:30px}.button{display:inline-flex;align-items:center;justify-content:center;gap:20px;padding:15px 27px;border-radius:40px;background:#e86723;color:white;font-size:12px;font-weight:700;box-shadow:0 8px 24px #c8682520}.arrow{font-size:20px;font-weight:400;line-height:16px}.note{font-size:11px;color:#847569}
        .photo{width:490px;height:490px;border-radius:50%;overflow:hidden;justify-self:end}.photo img{height:100%;width:100%;object-fit:cover;transform:scale(1.07)}
        @media(max-width:600px){main{max-width:calc(100% - 36px);width:auto;height:730px;padding:35px 0;grid-template-columns:1fr;gap:28px;align-content:center}.copy{text-align:center;max-width:100%}.eyebrow{justify-content:center;font-size:8px;letter-spacing:1.2px;margin-bottom:18px}h1{font-size:60px;margin-bottom:18px}p{font-size:13px;max-width:325px;margin:auto}.actions{justify-content:center;margin-top:24px}.button{padding:14px 22px;font-size:11px}.note{display:none}.photo{width:300px;height:300px;justify-self:center}}
      </style></head><body><main><div class="copy"><div class="eyebrow">${design.eyebrow}</div><h1>${design.first}<br>${design.second} <span>${design.accent}</span></h1><p>${design.description}</p><div class="actions"><span class="button">${design.button}<span class="arrow">→</span></span><span class="note">Rasa rumahan, untuk setiap momen.</span></div></div><div class="photo"><img src="data:image/webp;base64,${photo}" alt=""></div></main></body></html>`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode()));
      });
      const screenshot = await page.screenshot();
      const filename = `${design.file}${mobile ? "-mobile" : ""}.webp`;
      await sharp(screenshot)
        .webp({ quality: 90 })
        .toFile(path.join(directory, filename));
      console.log(filename);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
