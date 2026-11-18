import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/icon";
import { feedbackEmail, feedbackEmailIsExample, feedbackEmailLink } from "@/lib/feedback-contact";
import FeedbackForm from "./feedback-form";
import styles from "./feedback.module.css";

export const metadata: Metadata = {
  title: "Saran & Keluhan | FoodStore",
  description: "Sampaikan saran, pengalaman, dan keluhan pesanan Anda kepada tim FoodStore.",
};

export default function FeedbackPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="FoodStore beranda"><span><Icon name="bowl" size={26} /></span>food<strong>store.</strong></Link>
        <Link href="/" className={styles.back}><Icon name="arrow" size={17} /> Kembali ke toko</Link>
      </header>
      <main className={styles.layout}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>SUARAMU BERARTI UNTUK KAMI</span>
          <h1>Kami siap <span>mendengar.</span></h1>
          <p>Ceritakan pengalamanmu bersama FoodStore. Saran dan masukanmu membantu kami menyajikan yang lebih baik.</p>
          <div className={styles.note}><Icon name="chat" size={25} /><div><strong>Kita bicarakan bersama</strong><p>Untuk keluhan pesanan, cantumkan nomor pesanan dan detail kejadian agar tim lebih mudah membantu.</p></div></div>
          <div className={styles.contactMethods} aria-label="Hubungi lewat WhatsApp atau email">
            <a className={styles.contact} href="https://wa.me/6285157742849" target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={20} /> WhatsApp 0851 5774 2849</a>
            <a className={`${styles.contact} ${styles.emailContact}`} href={feedbackEmailLink}><Icon name="mail" size={20} /> {feedbackEmail}{feedbackEmailIsExample && <span className={styles.example}>Contoh</span>}</a>
          </div>
        </div>
        <FeedbackForm />
      </main>
      <footer className={styles.footer}>© {new Date().getFullYear()} FoodStore.<a href="https://nusakaryadigital.com/" target="_blank" rel="noopener noreferrer">Powered By Nusakarya Digital Solution</a></footer>
    </div>
  );
}
