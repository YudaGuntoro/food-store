const steps = [
    { title: "Pilih menu", text: "Temukan hidangan favorit untuk momenmu." },
    { title: "Susun pesanan", text: "Lengkapi jumlah, tanggal, dan alamat pesanan." },
    { title: "Konfirmasi Pesanan", text: "Pastikan menu, jadwal, dan ongkir dengan tim kami." },
    { title: "Selesaikan pembayaran", text: "Bayar sesuai rincian yang sudah disepakati." },
    { title: "Terima & nikmati", text: "Ambil pesanan atau terima kiriman sesuai jadwal." },
];

export default function OrderingSteps({ pageHeading = false }: { pageHeading?: boolean }) {
  const Heading = pageHeading ? "h1" : "h2";
  return (
    <section id="cara-pesan" className="ordering-section" aria-labelledby="ordering-title">
      <div className="container">
        <div className="ordering-heading">
          <div>
            <span className="ordering-eyebrow">CARA PESAN DI FOODSTORE</span>
            <Heading id="ordering-title">Pesan mudah,<br /><span>tinggal nikmati.</span></Heading>
          </div>
        </div>
        <div className="ordering-timeline">
          <svg className="ordering-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path d="M100 24 L300 64 L500 24 L700 64 L900 24" /></svg>
          <ol className="ordering-list" aria-label="Lima langkah pesan online">
            {steps.map((step, index) => (
              <li key={index}>
                <span className="ordering-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
