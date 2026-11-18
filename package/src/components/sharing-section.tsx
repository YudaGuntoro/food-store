import Image from "next/image";
import Icon from "./icon";

const sharingWhatsapp = `https://wa.me/6285157742849?text=${encodeURIComponent("Halo FoodStore, saya ingin merencanakan paket catering untuk kegiatan berbagi.\n\nNama:\nJenis kegiatan:\nTanggal kegiatan:\nJumlah porsi:\nAnggaran per porsi:\nLokasi pembagian / pengiriman:\nKebutuhan menu atau pantangan:\n\nMohon bantuan pilihan menu, ketersediaan, dan rincian biayanya. Terima kasih.")}`;

export default function SharingSection() {
  return (
    <section id="berbagi" className="sharing-section" aria-labelledby="sharing-title">
      <div className="container">
        <div className="sharing-card">
          <div className="sharing-photo">
            <Image src="/images/moments/berbagi-kebaikan.webp" alt="Tim menyiapkan nasi box bersama di dapur untuk kegiatan berbagi" fill sizes="(max-width: 760px) 100vw, 520px" />
            <span className="sharing-photo-tag"><Icon name="people" size={17} /> Disiapkan untuk dibagikan</span>
          </div>
          <div className="sharing-copy">
            <span className="sharing-eyebrow"><Icon name="spark" size={15} /> SAJIAN UNTUK BERBAGI</span>
            <h2 id="sharing-title"><span>Berbagi Kebaikan</span><br />Lewat Hidangan</h2>
            <p className="sharing-intro">Kami menerima pesanan catering untuk Jumat Berkah, kegiatan sosial lintas agama, dan acara komunitas. Siapkan hidangan bagi sesama dengan rasa yang hangat dan sepenuh hati.</p>
            <ul className="sharing-benefits">
              <li><Icon name="check" size={16} /> Menu sesuai anggaran</li>
              <li><Icon name="check" size={16} /> Porsi sesuai kebutuhan</li>
              <li><Icon name="check" size={16} /> Jadwal pembagian bisa didiskusikan</li>
            </ul>
            <a className="sharing-cta" href={sharingWhatsapp} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" size={19} /> Rencanakan Paket Berbagi <Icon name="arrow" size={18} />
            </a>
            <p className="sharing-signoff">Untuk siapa pun yang ingin berbagi kebaikan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
