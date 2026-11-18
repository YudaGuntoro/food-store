"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  categories,
  products,
  rupiah,
  whatsappLink,
  type Category,
  type Product,
} from "@/lib/catalog";
import Icon from "./icon";
import Modal from "./modal";
import HeroSlider from "./hero-slider";
import CateringFavorites from "./catering-favorites";
import ReservationSticker from "./reservation-sticker";
import NavArtwork from "./nav-artwork";
import FeaturedMenu from "./featured-menu";
import FamilyGallery from "./family-gallery";
import OrderingSteps from "./ordering-steps";
import StoreLocation from "./store-location";
import DatePicker from "./date-picker";
import SharingSection from "./sharing-section";
import { FooterContact, FooterFeedback } from "./footer-contact";
import { PaymentCartContext, type PaidReceipt } from "./payment-cart-context";

type CartItem = { id: string; quantity: number };
const CART_KEY = "foodstore-cart-v1";
const PAID_CART_KEY = "foodstore-paid-cart-v1";
function FoodImage({
  image,
  alt,
  className = "",
  priority = false,
}: {
  image: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={`/images/food/${image}.webp`}
      alt={alt}
      fill
      sizes="(max-width: 600px) 90vw, (max-width: 900px) 50vw, 600px"
      className={className}
      priority={priority}
    />
  );
}
function Logo({ onClick, href = "#" }: { onClick?: () => void; href?: string }) {
  return (
    <a
      href={href}
      className="brand"
      aria-label="FoodStore beranda"
      onClick={onClick}
    >
      <span className="brand-mark">
        <Icon name="bowl" size={29} />
      </span>
      <span>
        food<span className="orange">store</span>
        <span className="brand-dot">.</span>
      </span>
    </a>
  );
}

export default function Storefront({ children, activePage = "#", showReservation = true }: { children?: ReactNode; activePage?: string; showReservation?: boolean }) {
  const router = useRouter();
  const innerPage = children != null;
  const [category, setCategory] = useState<Category>("Semua Menu");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState(activePage);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [orderSummary, setOrderSummary] = useState("");
  const [inquirySummary, setInquirySummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const paymentInFlight = useRef(false);
  const [paidReceipt, setPaidReceipt] = useState<PaidReceipt | null>(null);
  const handledPayments = useRef(new Set<string>());

  useEffect(() => { setActiveNav(activePage); }, [activePage]);

  useEffect(() => {
    if (innerPage) return;
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") ?? "");
    const requestedCategory = params.get("category");
    if (categories.some(item => item === requestedCategory)) setCategory(requestedCategory as Category);
  }, [innerPage]);

  useEffect(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(data)) {
        const clean = new Map<string, CartItem>();
        for (const item of data)
          if (
            item &&
            typeof item.id === "string" &&
            products.some((p) => p.id === item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 999
          )
            clean.set(item.id, { id: item.id, quantity: item.quantity });
        setCart([...clean.values()]);
      }
    } catch {
      /* A blocked browser store or invalid saved cart starts empty. */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      } catch {
        /* Cart still works in memory. */
      }
    }
  }, [cart, loaded]);
  useEffect(() => {
    if (!loaded || !paidReceipt || handledPayments.current.has(paidReceipt.orderId)) return;
    let saved: string[] = [];
    try {
      const value: unknown = JSON.parse(localStorage.getItem(PAID_CART_KEY) || "[]");
      if (Array.isArray(value)) saved = value.filter((id): id is string => typeof id === "string").slice(-49);
    } catch { /* Keep the in-memory protection when browser storage is unavailable. */ }
    handledPayments.current.add(paidReceipt.orderId);
    if (saved.includes(paidReceipt.orderId)) return;
    let remaining = cart;
    if (paidReceipt.items?.length) {
      remaining = cart.flatMap(item => {
        const paid = paidReceipt.items!.find(line => line.id === item.id)?.quantity ?? 0;
        return item.quantity > paid ? [{ ...item, quantity: item.quantity - paid }] : [];
      });
    } else {
      // Older sandbox sessions did not retain item IDs. Only clear an exact subtotal match.
      const currentTotal = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price ?? 0) * item.quantity, 0);
      if (currentTotal === paidReceipt.total) remaining = [];
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(remaining));
      localStorage.setItem(PAID_CART_KEY, JSON.stringify([...saved, paidReceipt.orderId]));
    } catch { /* Checkout still works in memory if browser storage is blocked. */ }
    setCart(remaining);
    setOrderSummary("");
  }, [paidReceipt, loaded, cart]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "Semua Menu" || p.category === category) &&
          `${p.name} ${p.description}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    [category, search],
  );
  const cartLines = cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? [{ ...item, product }] : [];
  });
  const count = cart.reduce((n, item) => n + item.quantity, 0);
  const total = cartLines.reduce(
    (n, item) => n + item.quantity * item.product.price,
    0,
  );
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function add(product: Product) {
    setCart((current) => {
      const existing = current.find((i) => i.id === product.id);
      return existing
        ? current.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(999, i.quantity + 1) }
              : i,
          )
        : [...current, { id: product.id, quantity: 1 }];
    });
    setOrderSummary("");
    setNotice(`${product.name} masuk keranjang`);
  }
  function update(id: string, quantity: number) {
    setCart((current) =>
      quantity <= 0
        ? current.filter((i) => i.id !== id)
        : current.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(999, quantity) } : i,
          ),
    );
    setOrderSummary("");
  }
  function chooseCategory(next: Category) {
    if (innerPage) {
      router.push(`/?category=${encodeURIComponent(next)}#menu`);
      return;
    }
    setCategory(next);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }
  function openInquiry() {
    setInquirySummary("");
    setCopied(false);
    setInquiryOpen(true);
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setNotice("Salin teks ringkasan secara manual dari kotak yang tersedia.");
    }
  }
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cartLines.length) return;
    const data = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "sandbox") {
      if (paymentInFlight.current) return;
      paymentInFlight.current = true;
      setPaymentBusy(true);
      setPaymentError("");
      try {
        const response = await fetch("/api/payments/sandbox", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cart, name: data.get("name"), date: data.get("date"), address: data.get("address"), notes: data.get("notes") }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Pembayaran sandbox belum dapat dimulai.");
        const target = new URL(result.redirectUrl);
        if (target.origin !== "https://app.sandbox.midtrans.com" || !target.pathname.startsWith("/snap/")) throw new Error("Tautan pembayaran tidak valid.");
        window.location.assign(target.href);
      } catch (error) {
        setPaymentError(error instanceof Error ? error.message : "Pembayaran sandbox belum dapat dimulai.");
      } finally {
        paymentInFlight.current = false;
        setPaymentBusy(false);
      }
      return;
    }
    const summary = `Halo FoodStore, saya ingin menanyakan pesanan:\n\n${cartLines.map((i) => `${i.quantity} × ${i.product.name} — ${rupiah(i.quantity * i.product.price)}`).join("\n")}\n\nSubtotal menu: ${rupiah(total)}\nNama: ${String(data.get("name")).trim()}\nTanggal acara: ${data.get("date")}\nAlamat pengiriman: ${String(data.get("address")).trim()}\nCatatan: ${String(data.get("notes") || "-").trim()}\n\nMohon konfirmasi ketersediaan, ongkir, dan total akhir. Harga katalog masih contoh.`;
    setOrderSummary(summary);
    setCopied(false);
  }
  function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setInquirySummary(
      `Halo FoodStore, saya ingin konsultasi catering.\n\nNama: ${String(data.get("name")).trim()}\nTanggal acara: ${data.get("date")}\nJumlah tamu: ${data.get("guests")} orang\nKebutuhan: ${String(data.get("needs")).trim()}\n\nMohon informasi menu, ketersediaan, dan penawarannya.`,
    );
    setCopied(false);
  }
  function Summary({ text }: { text: string }) {
    const link = whatsappLink(text);
    return (
      <div className="summary">
        <span className="eyebrow">
          {link ? "SIAP DIKIRIM" : "PRATINJAU PESANAN"}
        </span>
        <h3>Ringkasan sudah siap.</h3>
        <p>
          {link
            ? "Kirim ke WhatsApp toko untuk meminta konfirmasi. Pesanan belum tercatat sebelum disetujui toko."
            : "Nomor WhatsApp toko belum diatur. Ringkasan ini bisa disalin; belum ada pesanan yang dikirim."}
        </p>
        <textarea
          readOnly
          value={text}
          rows={10}
          aria-label="Ringkasan pesan"
        />
        <div className="summary-actions">
          <button className="button secondary" onClick={() => copy(text)}>
            {copied ? "Tersalin!" : "Salin ringkasan"}
          </button>
          {link && (
            <a
              className="button primary"
              href={link}
              target="_blank"
              rel="noreferrer"
            >
              Kirim ke WhatsApp <Icon name="arrow" size={18} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href={innerPage ? "/#menu" : "#menu"}>
        Langsung ke menu
      </a>
      <header className="header">
        <div className="header-main container">
          <div className="header-brand">
            <Logo href={innerPage ? "/" : "#"} onClick={() => setActiveNav("#")} />
            <span className="brand-tagline">Catering untuk setiap momen</span>
          </div>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (innerPage) {
                router.push(`/?q=${encodeURIComponent(search)}#menu`);
                return;
              }
              document
                .getElementById("menu")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <input
              aria-label="Cari menu makanan"
              placeholder="Cari nasi box, tumpeng, atau snack…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="search-submit"
              type="submit"
              aria-label="Cari menu"
            >
              <Icon name="search" size={21} />
            </button>
          </form>
          <div className="header-actions">
            <button
              className={`cart-button${count > 0 ? " has-items" : ""}`}
              onClick={() => {
                setCopied(false);
                setCartOpen(true);
              }}
              aria-label={`Buka keranjang, ${count} item`}
            >
              <Icon name="bag" size={22} />
              {count > 0 && <span className="cart-count" key={count}>{count}</span>}
            </button>
            <button
              className="mobile-toggle icon-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Buka navigasi"
              aria-expanded={mobileMenu}
            >
              <Icon name={mobileMenu ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <nav
          className={`nav container ${mobileMenu ? "is-open" : ""}`}
          aria-label="Navigasi utama"
        >
          <div className="nav-links">
            {[
              ["Beranda", innerPage ? "/" : "#"],
              ["Pilihan Menu", "#menu"],
              ["Banyak Hematnya!", "/paket-hemat"],
              ["Dapur FoodStore", "/dapur-foodstore"],
              ["Cara Pesan", "/cara-pesan"],
            ].map(([label, href]) =>
              href === "#menu" ? (
                <div
                  className="nav-category"
                  key={href}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setCategoryMenuOpen(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setCategoryMenuOpen(false);
                  }}
                >
                  <a
                    href={innerPage ? "/#menu" : href}
                    className={activeNav === href ? "nav-active" : ""}
                    aria-label={label}
                    aria-current={activeNav === href ? "location" : undefined}
                    onClick={() => {
                      setActiveNav(href);
                      setMobileMenu(false);
                      setCategoryMenuOpen(false);
                    }}
                  >
                    {label}
                  </a>
                  <button
                    className="nav-category-toggle"
                    aria-label="Buka kategori menu"
                    aria-expanded={categoryMenuOpen}
                    aria-controls="nav-category-options"
                    onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                  >
                    <Icon name="chevron" size={15} />
                  </button>
                  {categoryMenuOpen && (
                    <div
                      id="nav-category-options"
                      className="nav-category-options"
                    >
                      {categories.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            chooseCategory(item);
                            setActiveNav("#menu");
                            setCategoryMenuOpen(false);
                            setMobileMenu(false);
                          }}
                        >
                          {item}
                          <Icon name="arrow" size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={href}
                  className={`${activeNav === href ? "nav-active" : ""} ${href === "/paket-hemat" || href === "/dapur-foodstore" ? "nav-art-link" : ""}`}
                  aria-label={label}
                  aria-current={activeNav === href ? "location" : undefined}
                  href={href}
                  onClick={() => {
                    setActiveNav(href);
                    setMobileMenu(false);
                    setCategoryMenuOpen(false);
                  }}
                >
                  {href === "/paket-hemat" ? (
                    <NavArtwork kind="promo" />
                  ) : href === "/dapur-foodstore" ? (
                    <NavArtwork kind="story" />
                  ) : (
                    label
                  )}
                </Link>
              ),
            )}
          </div>
          <a
            className="consult-link"
            href={`https://wa.me/6285157742849?text=${encodeURIComponent("Halo FoodStore, saya ingin konsultasi catering.")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konsultasi catering melalui WhatsApp 085157742849"
          >
            <span className="contact-badge-label">Info Catering</span>
            <span className="contact-badge-number">
              <Icon name="phone" size={17} />
              <span>0851 5774 2849</span>
            </span>
          </a>
        </nav>
      </header>

      <main>
        <PaymentCartContext.Provider value={setPaidReceipt}>
        {innerPage ? children : <>
        <HeroSlider onCategory={chooseCategory} />

        <CateringFavorites
          onCategory={chooseCategory}
          onInquiry={openInquiry}
        />

        <FeaturedMenu onSelect={setSelected} />

        <section id="menu" className="menu-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <h2>
                  <span className="catalog-keyword">Sajian Istimewa</span>{" "}
                  dari Dapur Kami
                </h2>
              </div>
              <span className="menu-note">
                <span className="tiny-dot" /> Katalog & harga contoh
              </span>
            </div>
            <div className="catalog-controls">
              <div className="tabs" aria-label="Filter kategori">
                {categories.map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    className={category === c ? "active" : ""}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span className="result-count">
                {visibleProducts.length} pilihan menu
              </span>
            </div>
            {search && (
              <p className="search-result">
                Hasil untuk “{search}”{" "}
                <button onClick={() => setSearch("")}>
                  Hapus pencarian <Icon name="close" size={13} />
                </button>
              </p>
            )}
            {visibleProducts.length ? (
              <div className="product-grid">
                {visibleProducts.map((p) => (
                  <article className="product-card" key={p.id}>
                    <button
                      className="product-photo"
                      onClick={() => setSelected(p)}
                      aria-label={`Lihat detail ${p.name}`}
                    >
                      <FoodImage image={p.image} alt={p.name} />
                      {p.badge && (
                        <span className="product-badge">{p.badge}</span>
                      )}
                      <span className="quick-view">
                        Lihat detail <Icon name="arrow" size={16} />
                      </span>
                    </button>
                    <div className="product-body">
                      <div className="product-meta">
                        <span>{p.category}</span>
                        <span>
                          <Icon name="people" size={13} /> {p.serving}
                        </span>
                      </div>
                      <h3>
                        <button onClick={() => setSelected(p)}>{p.name}</button>
                      </h3>
                      <p>{p.description}</p>
                      <div className="product-bottom">
                        <div>
                          {p.originalPrice && (
                            <del>{rupiah(p.originalPrice)}</del>
                          )}
                          <strong>{rupiah(p.price)}</strong>
                        </div>
                        <button
                          className="add-button"
                          onClick={() => add(p)}
                          aria-label={`Tambah ${p.name} ke keranjang`}
                        >
                          <Icon name="plus" size={22} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icon name="search" size={40} />
                <h3>Menu belum ditemukan.</h3>
                <p>Coba kata lain atau lihat semua kategori.</p>
                <button
                  className="button primary"
                  onClick={() => {
                    setCategory("Semua Menu");
                    setSearch("");
                  }}
                >
                  Lihat semua menu
                </button>
              </div>
            )}
          </div>
        </section>

        <OrderingSteps />

        <SharingSection />

        <section id="promo" className="promo-section container">
          <div id="kontak" className="promo-banner">
            <div className="promo-copy">
              <span className="promo-eyebrow">
                <Icon name="spark" size={16} /> PAKET HEMAT UNTUK ACARA SPESIAL
              </span>
              <h2>
                Acara boleh ramai.
                <br />
                <span>Budget tetap santai.</span>
              </h2>
              <p>
                Ada acara spesial? Kita rencanakan bareng. Pilih nasi box untuk
                rapat, kumpul keluarga, atau traktir orang terdekat sesuai kebutuhanmu.
              </p>
              <div className="promo-actions">
              <button
                className="button promo-cta"
                onClick={() => chooseCategory("Nasi Box")}
              >
                Lihat paket nasi box{" "}
                <span className="promo-cta-icon">
                  <Icon name="arrow" size={18} />
                </span>
              </button>
                <button className="button promo-consult" onClick={openInquiry}>
                  <Icon name="chat" size={18} /> Konsultasi catering
                </button>
              </div>
            </div>
            <div className="promo-photo">
              <FoodImage
                image="nasi-box"
                alt="Nasi box dengan ayam goreng, sayuran, dan sambal"
              />
            </div>
            <div className="promo-price">
              <span>Mulai dari</span>
              <strong>25rb</strong>
              <span>per box</span>
            </div>
            <span className="promo-decoration" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>

        <FamilyGallery />

        <StoreLocation />

        <FooterFeedback />
        </>}
        </PaymentCartContext.Provider>
      </main>

      <footer className="footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Logo href={innerPage ? "/" : "#"} />
            <p>
              Rasa rumahan, cerita kebersamaan.
              <br />
              Hidangan Nusantara untuk setiap momen.
            </p>
          </div>
          <div>
            <h3>Jelajahi</h3>
            <a href={innerPage ? "/#menu" : "#menu"}>Pilihan menu</a>
            <a href="/paket-hemat">Paket hemat</a>
            <a href="/dapur-foodstore">Dapur FoodStore</a>
          </div>
          <div>
            <h3>Bantuan</h3>
            <a href="/cara-pesan">Cara pesan</a>
            <button onClick={openInquiry}>Konsultasi catering</button>
            <button onClick={() => setCartOpen(true)}>Keranjang saya</button>
          </div>
          <FooterContact />
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} FoodStore.</span>
          <a href="https://nusakaryadigital.com/" target="_blank" rel="noopener noreferrer">Powered By Nusakarya Digital Solution</a>
          <a href="#">Kembali ke atas ↑</a>
        </div>
      </footer>
      {showReservation && <ReservationSticker onClick={openInquiry} />}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <span>
              <Icon name="check" size={18} />
            </span>
            {notice}
          </>
        )}
      </div>

      {selected && (
        <Modal title="Kenali menunya" onClose={() => setSelected(null)}>
          <div className="detail-photo">
            <FoodImage image={selected.image} alt={selected.name} />
          </div>
          <div className="detail-content">
            <span className="eyebrow">
              {selected.category} · {selected.serving}
            </span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div className="detail-price">
              <strong>{rupiah(selected.price)}</strong>
              {selected.originalPrice && (
                <del>{rupiah(selected.originalPrice)}</del>
              )}
            </div>
            <p className="small-note">
              Harga & menu contoh. Foto ilustrasi AI. Sampaikan alergi atau
              permintaan khusus pada catatan pesanan.
            </p>
            <button
              className="button primary full-width"
              onClick={() => {
                add(selected);
                setSelected(null);
              }}
            >
              Tambah ke keranjang <Icon name="plus" size={20} />
            </button>
          </div>
        </Modal>
      )}

      {cartOpen && (
        <Modal
          title={`Keranjangmu (${count})`}
          drawer
          onClose={() => setCartOpen(false)}
        >
          {cartLines.length ? (
            <div className="cart-content">
              <div className="cart-items">
                {cartLines.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-photo">
                      <FoodImage image={item.product.image} alt="" />
                    </div>
                    <div className="cart-item-info">
                      <strong>{item.product.name}</strong>
                      <span>{rupiah(item.product.price)}</span>
                      <div className="quantity-control">
                        <button
                          aria-label={`Kurangi ${item.product.name}`}
                          onClick={() => update(item.id, item.quantity - 1)}
                        >
                          <Icon name="minus" size={15} />
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          disabled={item.quantity >= 999}
                          aria-label={`Tambah ${item.product.name}`}
                          onClick={() => update(item.id, item.quantity + 1)}
                        >
                          <Icon name="plus" size={15} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => update(item.id, 0)}
                      aria-label={`Hapus ${item.product.name}`}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Subtotal menu</span>
                <strong>{rupiah(total)}</strong>
              </div>
              <p className="small-note">
                Harga contoh. Belum termasuk ongkir. Ketersediaan dan total
                akhir dikonfirmasi oleh toko.
              </p>
              {orderSummary ? (
                <>
                  <Summary text={orderSummary} />
                  <button
                    className="text-link"
                    onClick={() => setOrderSummary("")}
                  >
                    Ubah data pesanan
                  </button>
                </>
              ) : (
                <form className="order-form" onSubmit={checkout}>
                  <h3>Lengkapi rencana pesanan</h3>
                  <label>
                    Nama pemesan
                    <input
                      name="name"
                      required
                      maxLength={100}
                      placeholder="Nama lengkap"
                      pattern=".*\S.*"
                    />
                  </label>
                  <DatePicker id="checkout-date" name="date" label="Tanggal acara" min={minDate} required />
                  <label>
                    Alamat pengiriman
                    <textarea
                      name="address"
                      required
                      maxLength={500}
                      placeholder="Alamat lengkap dan kota"
                      rows={2}
                    />
                  </label>
                  <label>
                    Catatan <span>(opsional)</span>
                    <textarea
                      name="notes"
                      maxLength={1000}
                      placeholder="Jam acara, tingkat pedas, alergi, atau permintaan lain"
                      rows={2}
                    />
                  </label>
                  <button className="button primary full-width" type="submit" disabled={paymentBusy}>
                    Siapkan ringkasan pesanan <Icon name="arrow" size={18} />
                  </button>
                  <p className="small-note">
                    Langkah ini belum mengirim pesanan atau melakukan
                    pembayaran.
                  </p>
                  <div className="sandbox-checkout">
                    <span className="sandbox-label">MIDTRANS SANDBOX</span>
                    <h4>Coba alur pembayaran</h4>
                    <p>Simulasi subtotal menu tanpa uang asli. Belum termasuk ongkir dan belum membuat pesanan catering.</p>
                    {paymentError && <p className="sandbox-error" role="alert">{paymentError}</p>}
                    <button className="button secondary full-width" type="submit" name="payment" value="sandbox" disabled={paymentBusy}>{paymentBusy ? "Menyiapkan pembayaran…" : "Coba bayar di Sandbox"}<Icon name="arrow" size={18} /></button>
                    <a href="/pembayaran" className="text-link">Lihat status uji pembayaran terakhir</a>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="bag" size={42} />
              </span>
              <h3>Masih kosong, nih.</h3>
              <p>Yuk, isi dengan menu yang bikin harimu lebih nikmat.</p>
              <button
                className="button primary"
                onClick={() => {
                  setCartOpen(false);
                  document
                    .getElementById("menu")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Jelajahi menu <Icon name="arrow" size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}

      {inquiryOpen && (
        <Modal
          title="Rencanakan cateringmu"
          onClose={() => setInquiryOpen(false)}
        >
          {inquirySummary ? (
            <div className="inquiry-content">
              <Summary text={inquirySummary} />
              <button
                className="text-link"
                onClick={() => setInquirySummary("")}
              >
                Ubah kebutuhan acara
              </button>
            </div>
          ) : (
            <form
              className="order-form inquiry-content"
              onSubmit={submitInquiry}
            >
              <p>
                Ceritakan sedikit tentang acaramu. Kami akan siapkan ringkasan
                kebutuhan untuk didiskusikan dengan toko.
              </p>
              <label>
                Nama kamu
                <input
                  name="name"
                  required
                  maxLength={100}
                  placeholder="Nama lengkap"
                />
              </label>
              <div className="form-row">
                <DatePicker id="inquiry-date" name="date" label="Tanggal acara" min={minDate} required />
                <label>
                  Jumlah tamu
                  <input
                    name="guests"
                    type="number"
                    min={1}
                    max={10000}
                    required
                    placeholder="Contoh: 50"
                  />
                </label>
              </div>
              <label>
                Kebutuhan acara
                <textarea
                  name="needs"
                  required
                  maxLength={1000}
                  rows={4}
                  placeholder="Jenis acara, lokasi, menu yang diinginkan, dan perkiraan budget"
                />
              </label>
              <button type="submit" className="button primary full-width">
                Siapkan konsultasi <Icon name="arrow" size={18} />
              </button>
              <p className="small-note">
                Belum ada pesan yang dikirim. Pengiriman WhatsApp tersedia
                setelah nomor toko diatur.
              </p>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
