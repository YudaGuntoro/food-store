import Icon from "./icon";
import CateringIcon from "./catering-icon";

// Fill these with the store's confirmed details when supplied.
const address = "";
const mapsUrl = "";
const locationInquiry = `https://wa.me/6285157742849?text=${encodeURIComponent("Halo FoodStore, boleh minta alamat lengkap, titik Google Maps, dan jam kunjungan toko?")}`;

export default function StoreLocation() {
  return (
    <section id="lokasi" className="store-location" aria-labelledby="location-title">
      <div className="container location-layout">
        <div className="location-copy">
          <span className="location-eyebrow">MAMPIR & BAWA PULANG KEHANGATANNYA</span>
          <h2 id="location-title">Temukan <span>Lokasi Kami</span></h2>
          <p className="location-intro">Obrolkan menu favoritmu dan rencanakan pengambilan pesanan bersama tim FoodStore.</p>
          <div className="location-detail">
            <span className="location-detail-icon"><CateringIcon kind="store" /></span>
            <div><h3>FoodStore {!address && <span className="location-example">Contoh</span>}</h3><p>{address || "Jl. Rasa Nusantara No. 12, Kelurahan Sukarasa, Jakarta Selatan, DKI Jakarta 12345."}</p></div>
          </div>
          <div className="location-detail">
            <span className="location-detail-icon"><CateringIcon kind="schedule" /></span>
            <div><h3>Rencanakan kunjunganmu <span className="location-example">Contoh</span></h3><p>Senin–Sabtu, 09.00–18.00 WIB.<br />Minggu & hari libur: dengan janji terlebih dahulu.</p></div>
          </div>
          <a className="location-cta" href={mapsUrl || locationInquiry} target="_blank" rel="noopener noreferrer">
            <Icon name={mapsUrl ? "pin" : "whatsapp"} size={19} />
            {mapsUrl ? "Buka Google Maps" : "Tanya lokasi via WhatsApp"}
            <Icon name="arrow" size={18} />
          </a>
        </div>
        <div className="location-visual">
          {address ? (
            <iframe title="Peta lokasi FoodStore" src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          ) : (
            <div className="location-welcome">
              <span className="location-pin"><CateringIcon kind="store" /></span>
              <span className="location-visual-label">DARI DAPUR KE MEJA MAKANMU</span>
              <h3>Sampai jumpa<br />di FoodStore<span>.</span></h3>
              <p>Tanyakan titik lokasi pada tim kami.<br />Kami bantu arahkan kunjunganmu.</p>
              <span className="location-signoff">Selalu ada tempat untuk cerita baru.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
