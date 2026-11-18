import Icon from "./icon";
import Link from "next/link";

const instagram = (process.env.NEXT_PUBLIC_STORE_INSTAGRAM || "").trim().replace(/^@/, "");
const tiktok = (process.env.NEXT_PUBLIC_STORE_TIKTOK || "").trim().replace(/^@/, "");
const email = (process.env.NEXT_PUBLIC_STORE_EMAIL || "").trim();
const channels = [
  { name: "WhatsApp", icon: "whatsapp" as const, detail: "0851 5774 2849", href: "https://wa.me/6285157742849" },
  { name: "Instagram", icon: "instagram" as const, detail: /^[a-z0-9._]+$/i.test(instagram) ? `@${instagram}` : "@foodstore.demo", href: /^[a-z0-9._]+$/i.test(instagram) ? `https://www.instagram.com/${instagram}/` : "" },
  { name: "TikTok", icon: "tiktok" as const, detail: /^[a-z0-9._]+$/i.test(tiktok) ? `@${tiktok}` : "@foodstore.demo", href: /^[a-z0-9._]+$/i.test(tiktok) ? `https://www.tiktok.com/@${tiktok}` : "" },
  { name: "Email", icon: "mail" as const, detail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "halo@foodstore.example", href: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : "" },
];

export function FooterContact() {
  return (
    <div className="footer-contact">
      <h3>Tetap terhubung</h3>
      <div className="footer-channels">
        {channels.map(channel => {
          const content = <><span className={`footer-channel-icon footer-channel-icon--${channel.icon}`}><Icon name={channel.icon} size={19} /></span><span><strong>{channel.name}{!channel.href && <span className="footer-example-label">Contoh</span>}</strong><small>{channel.detail}</small></span>{channel.href && <span className="footer-channel-arrow" aria-hidden="true">↗</span>}</>;
          return channel.href ? <a className="footer-channel" key={channel.name} href={channel.href} target={channel.icon === "mail" ? undefined : "_blank"} rel={channel.icon === "mail" ? undefined : "noopener noreferrer"}>{content}</a> : <div className="footer-channel pending" key={channel.name}>{content}</div>;
        })}
      </div>
    </div>
  );
}

export function FooterFeedback() {
  return (
    <section className="container footer-feedback-wrap" aria-labelledby="feedback-title">
      <div className="footer-feedback">
        <span className="footer-feedback-icon"><Icon name="chat" size={25} /></span>
        <div className="footer-feedback-copy">
          <h3 id="feedback-title">Kami siap mendengar<span>.</span></h3>
          <p>Punya saran, keluhan, atau cerita tentang pesananmu? Sampaikan ke tim FoodStore.</p>
        </div>
        <Link href="/saran-keluhan">Sampaikan saran & keluhan <Icon name="arrow" size={18} /></Link>
      </div>
    </section>
  );
}
