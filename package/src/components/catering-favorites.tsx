import type { Category } from "@/lib/catalog";
import CateringIcon, {
  type CateringIconKind as Illustration,
} from "./catering-icon";

const favorites: {
  title: string;
  description: string;
  compactDescription: string;
  illustration: Illustration;
  category?: Category;
}[] = [
  {
    title: "Aneka Nasi Kuning",
    compactDescription: "Nasi kuning & tumpeng untuk momen istimewa.",
    description:
      "Pilihan nasi kuning dan tumpeng untuk syukuran, kumpul keluarga, serta momen istimewa.",
    illustration: "rice",
    category: "Tumpeng",
  },
  {
    title: "Aneka Nasi Kebuli",
    compactDescription: "Ayam rempah, porsi sendiri atau berbagi.",
    description:
      "Nasi kebuli dengan ayam rempah dan pelengkap. Tersedia porsi sendiri maupun paket berbagi.",
    illustration: "kebuli",
    category: "Nasi Kebuli",
  },
  {
    title: "Aneka Snack Box",
    compactDescription: "Kudapan manis & gurih untuk berbagai acara.",
    description:
      "Kudapan manis dan gurih untuk menemani rapat, acara kantor, atau obrolan bersama.",
    illustration: "snack",
    category: "Snack Box",
  },
  {
    title: "Ulang Tahun",
    compactDescription: "Hidangan spesial untuk hari bahagiamu.",
    description:
      "Rencanakan hidangan untuk hari spesial. Diskusikan pilihan menu dan jumlah tamu bersama kami.",
    illustration: "birthday",
  },
  {
    title: "Mulai 25rb",
    compactDescription: "Nasi box lengkap mulai Rp25.000.",
    description:
      "Nasi box dengan lauk dan pelengkap, mulai Rp25.000 per box. Praktis untuk berbagai acara.",
    illustration: "budget",
    category: "Nasi Box",
  },
  {
    title: "Paket Keluarga",
    compactDescription: "Paket berbagi untuk makan bersama.",
    description:
      "Pilihan nasi box dan paket berbagi untuk makan bersama keluarga. Lengkapi kebersamaan dengan rasa rumahan.",
    illustration: "family",
    category: "Nasi Box",
  },
];

export default function CateringFavorites({
  onCategory,
  onInquiry,
}: {
  onCategory: (category: Category) => void;
  onInquiry: () => void;
}) {
  return (
    <section className="catering-favorites" aria-labelledby="favorites-heading">
      <div className="container">
        <h2 id="favorites-heading">
          <span className="favorites-keyword">Sajian</span> untuk Setiap Cerita
        </h2>
        <div className="favorites-grid">
          {favorites.map((item) => (
            <button
              className="favorite-item"
              key={item.title}
              onClick={() =>
                item.category ? onCategory(item.category) : onInquiry()
              }
            >
              <span className="favorite-illustration">
                <CateringIcon kind={item.illustration} />
              </span>
              <span className="favorite-copy">
                <span className="favorite-title">{item.title}</span>
                <span className="favorite-description favorite-description-full">{item.description}</span>
                <span className="favorite-description favorite-description-compact">{item.compactDescription}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
