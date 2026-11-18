import type { Metadata } from "next";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import "./header.css";
import "./contact-badge.css";
import "./cart-button.css";
import "./favorites.css";
import "./featured-menu.css";
import "./catalog.css";
import "./sharing-section.css";
import "./promo.css";
import "./family-gallery.css";
import "./ordering-steps.css";
import "./store-location.css";
import "./footer-contact.css";
import "./reservation.css";
import "./date-picker.css";
import "./payment.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://foodstore.nusakaryadigital.com"),
  title: "FoodStore — Rasa rumahan, untuk setiap momen",
  description:
    "Jelajahi pilihan nasi box, tumpeng, nasi kebuli, dan snack box FoodStore. Pilih menu favorit dan susun pesanan catering untuk acara Anda.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
