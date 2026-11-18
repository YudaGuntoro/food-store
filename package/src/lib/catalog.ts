export const categories = [
  "Semua Menu",
  "Nasi Box",
  "Tumpeng",
  "Nasi Kebuli",
  "Snack Box",
] as const;
export type Category = (typeof categories)[number];
export type Product = {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  serving: string;
};
export const products: Product[] = [
  {
    id: "box-ayam",
    name: "Nasi Box Ayam Nusantara",
    category: "Nasi Box",
    description:
      "Nasi putih hangat, ayam goreng berbumbu, tumis buncis, tempe orek, lalapan, dan sambal. Satu kotak penuh rasa rumahan.",
    price: 25000,
    originalPrice: 30000,
    image: "nasi-box",
    badge: "Paket hemat",
    serving: "1 orang",
  },
  {
    id: "tumpeng-spesial",
    name: "Tumpeng Kuning Spesial",
    category: "Tumpeng",
    description:
      "Nasi kuning berbentuk tumpeng dengan ayam goreng, telur iris, tempe orek, sayuran, dan sambal. Untuk momen berbagi bersama orang tersayang.",
    price: 185000,
    originalPrice: 200000,
    image: "tumpeng",
    badge: "Untuk berbagi",
    serving: "5–6 orang",
  },
  {
    id: "kebuli-ayam",
    name: "Nasi Kebuli Ayam Rempah",
    category: "Nasi Kebuli",
    description:
      "Nasi basmati berbumbu rempah, ayam panggang, bawang goreng, kismis, dan acar segar. Aroma hangat dalam setiap suapan.",
    price: 35000,
    image: "kebuli",
    serving: "1 orang",
  },
  {
    id: "snack-klasik",
    name: "Snack Box Teman Ngobrol",
    category: "Snack Box",
    description:
      "Perpaduan pastel, risoles, dadar gulung pandan, dan brownies. Teman manis dan gurih untuk rapat atau kumpul santai.",
    price: 22000,
    originalPrice: 25000,
    image: "snack-box",
    badge: "Manis & gurih",
    serving: "4 jenis snack",
  },
  {
    id: "box-keluarga",
    name: "Paket Nasi Box Keluarga",
    category: "Nasi Box",
    description:
      "Lima nasi box ayam Nusantara untuk keluarga, dengan nasi, ayam goreng, sayuran, tempe, dan sambal terpisah di setiap kotak.",
    price: 120000,
    originalPrice: 125000,
    image: "nasi-box",
    serving: "5 box",
  },
  {
    id: "tumpeng-acara",
    name: "Tumpeng Syukuran Bersama",
    category: "Tumpeng",
    description:
      "Paket dua tampah tumpeng kuning dengan lauk Nusantara. Pilihan untuk syukuran, ulang tahun, dan acara bersama.",
    price: 350000,
    image: "tumpeng",
    serving: "10–12 orang",
  },
  {
    id: "kebuli-berbagi",
    name: "Kebuli Ayam Paket Berbagi",
    category: "Nasi Kebuli",
    description:
      "Empat porsi nasi kebuli ayam dengan rempah, acar, dan sambal. Disajikan dalam porsi individual untuk dinikmati bersama.",
    price: 130000,
    originalPrice: 140000,
    image: "kebuli",
    serving: "4 porsi",
  },
  {
    id: "snack-rapat",
    name: "Snack Box Paket Meeting",
    category: "Snack Box",
    description:
      "Lima kotak snack, masing-masing berisi empat kudapan manis dan gurih untuk menemani agenda kantor atau pertemuan komunitas.",
    price: 105000,
    image: "snack-box",
    serving: "5 box",
  },
];
export const rupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
export const storeWhatsapp = (
  process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? ""
).replace(/\D/g, "");
export const whatsappLink = (message: string) =>
  /^\d{9,15}$/.test(storeWhatsapp)
    ? `https://wa.me/${storeWhatsapp}?text=${encodeURIComponent(message)}`
    : null;
