import type { Metadata } from "next";
import Image from "next/image";
import ContentPage from "@/components/content-page";
import Icon from "@/components/icon";
import { products, rupiah } from "@/lib/catalog";
import styles from "@/components/content-page.module.css";

export const metadata: Metadata = { title: "Banyak Hematnya! | FoodStore", description: "Pilihan paket nasi box, tumpeng, kebuli, dan snack untuk acara serta momen berbagi." };
const packageIds = ["box-ayam", "box-keluarga", "snack-rapat", "kebuli-berbagi", "tumpeng-spesial", "tumpeng-acara"];
const consult = `https://wa.me/6285157742849?text=${encodeURIComponent("Halo FoodStore, saya ingin konsultasi paket catering. Jenis acara: \nTanggal: \nJumlah porsi: \nAnggaran: ")}`;

const discountPercent = (price: number, originalPrice?: number) =>
  originalPrice && originalPrice > price ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
const heroProduct = products.find(product => product.id === "box-ayam")!;

export default function DealsPage() {
  return <ContentPage active="deals">
    <section className={styles.hero}>
      <div><span className={styles.eyebrow}>Banyak Hematnya!</span><h1>Acara boleh ramai.<br /><em>Budget tetap santai.</em></h1><p>Dari makan bersama keluarga sampai agenda kantor. Temukan paket yang pas untuk jumlah tamu dan rencana acaramu.</p><a className={styles.button} href="#pilihan-paket">Temukan paketmu <Icon name="arrow" size={18} /></a></div>
      <div className={styles.heroImage}><Image src="/images/food/nasi-box.webp" alt="Nasi box dengan ayam, nasi, sayuran, dan sambal" fill priority sizes="(max-width: 540px) 100vw, 50vw" /><div className={styles.heroDiscount} aria-label={`Diskon ${discountPercent(heroProduct.price, heroProduct.originalPrice)} persen untuk ${heroProduct.name}`}><span>DISKON</span><strong>{discountPercent(heroProduct.price, heroProduct.originalPrice)}<small>%</small></strong><span>Nasi Box Ayam</span></div></div>
    </section>
    <section id="pilihan-paket" className={styles.section}>
      <div className={styles.intro}><h2>Paket pas, momen berkesan.</h2><p>Pilih hidangannya, lalu diskusikan tanggal, jumlah, dan pengiriman bersama tim kami.</p></div>
      <div className={styles.grid}>{packageIds.map(id => {
        const product = products.find(item => item.id === id)!;
        const discount = discountPercent(product.price, product.originalPrice);
        const saving = product.originalPrice ? product.originalPrice - product.price : 0;
        const link = `https://wa.me/6285157742849?text=${encodeURIComponent(`Halo FoodStore, saya tertarik ${product.name} (${product.serving}), harga katalog ${rupiah(product.price)}. Mohon konfirmasi harga dan ketersediaan.\nTanggal acara: \nJumlah paket: \nLokasi: `)}`;
        return <article className={styles.card} key={id}><div className={styles.cardImage}><Image src={`/images/food/${product.image}.webp`} alt={product.name} fill sizes="(max-width: 800px) 50vw, 33vw" />{discount > 0 && <span className={styles.discountBadge} aria-label={`Diskon ${discount} persen`}><span>DISKON</span><strong>{discount}<small>%</small></strong></span>}</div><div className={styles.cardBody}><span className={styles.tag}>{product.serving}</span><h3>{product.name}</h3><p>{product.description}</p><div className={styles.price}>{product.originalPrice && <del>{rupiah(product.originalPrice)}</del>}<strong>{rupiah(product.price)}</strong></div>{saving > 0 && <span className={styles.saving}>Lebih hemat {rupiah(saving)}</span>}<a className={styles.button} href={link} target="_blank" rel="noopener noreferrer" aria-label={`Tanya paket ${product.name} via WhatsApp`}><Icon name="whatsapp" size={17} /> Tanya paket</a></div></article>;
      })}</div>
    </section>
    <section className={styles.callout}><div><h2>Ada acara spesial?<br />Kita rencanakan bareng.</h2><p>Butuh paket untuk kegiatan berbagi, komunitas, atau acara keagamaan? Ceritakan kebutuhan dan anggaranmu.</p></div><a href={consult} target="_blank" rel="noopener noreferrer" className={styles.button}><Icon name="whatsapp" size={18} /> Konsultasi catering</a></section>
  </ContentPage>;
}
