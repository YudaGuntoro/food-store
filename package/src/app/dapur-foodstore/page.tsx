import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContentPage from "@/components/content-page";
import FamilyGallery from "@/components/family-gallery";
import Icon from "@/components/icon";
import styles from "@/components/content-page.module.css";

export const metadata: Metadata = { title: "Dapur FoodStore | Cerita di Meja Makan", description: "Kenali sajian Nusantara FoodStore dan temukan cerita kebersamaan di meja makan." };
const stories = [
  { image: "/images/food/tumpeng.webp", title: "Untuk momen istimewa", text: "Tumpeng kuning dan lauk Nusantara untuk menemani syukuran, perayaan kecil, dan waktu bersama keluarga." },
  { image: "/images/food/kebuli.webp", title: "Rasa yang mengajak berkumpul", text: "Nasi kebuli dengan ayam dan rempah. Pilihan hangat untuk dinikmati sendiri maupun dibagi bersama." },
  { image: "/images/moments/berbagi-kebaikan.webp", title: "Kebaikan dalam setiap sajian", text: "Paket makanan untuk Jumat Berkah, kegiatan sosial lintas agama, dan komunitas. Rencanakan porsinya sesuai kebutuhan." },
];

export default function KitchenPage() {
  return <ContentPage active="kitchen">
    <section className={styles.hero}><div><span className={styles.eyebrow}>Dapur FoodStore</span><h1>Dari dapur kami,<br /><em>untuk cerita kalian.</em></h1><p>Ada rasa yang mengingatkan pada rumah. Ada hidangan yang membuat kita duduk lebih lama. FoodStore ingin menjadi bagian dari momen sederhana itu.</p><a href="#cerita-dapur" className={styles.button}>Kenali sajian kami <Icon name="arrow" size={18} /></a></div><div className={styles.heroImage}><Image src="/images/moments/keluarga.webp" alt="Keluarga berkumpul menikmati hidangan di meja makan" fill priority sizes="(max-width: 540px) 100vw, 50vw" /></div></section>
    <section id="cerita-dapur" className={styles.section}><div className={styles.intro}><h2>Sajian yang menemani kebersamaan.</h2><p>Dari perayaan keluarga sampai momen berbagi, setiap acara punya hidangan pilihannya.</p></div><div className={styles.grid}>{stories.map(story => <article key={story.title} className={styles.card}><div className={styles.cardImage}><Image src={story.image} alt={story.title} fill sizes="(max-width: 800px) 50vw, 33vw" /></div><div className={styles.cardBody}><h3>{story.title}</h3><p>{story.text}</p></div></article>)}</div></section>
    <FamilyGallery />
    <section className={styles.callout}><div><h2>Cerita berikutnya, bersama siapa?</h2><p>Temukan hidangan untuk orang-orang tersayang dan momen yang sedang kamu rencanakan.</p></div><Link href="/paket-hemat" className={styles.button}>Lihat pilihan paket <Icon name="arrow" size={18} /></Link></section>
  </ContentPage>;
}
