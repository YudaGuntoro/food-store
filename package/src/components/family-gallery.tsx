"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./icon";

const moments = [
  { image: "keluarga", title: "Satu meja, banyak cerita", description: "Hidangan kesukaan, obrolan tanpa buru-buru, dan orang-orang tersayang.", alt: "Tiga generasi keluarga menikmati tumpeng bersama di meja makan", label: "Makan bersama" },
  { image: "perayaan", title: "Rayakan yang sederhana", description: "Karena momen kecil pun layak dirayakan dengan sepenuh hati.", alt: "Orang tua dan anak merayakan hari spesial dengan tumpeng di rumah", label: "Hari istimewa" },
  { image: "sore", title: "Sore yang terasa dekat", description: "Camilan di meja, teh hangat, dan cerita yang tak ada habisnya.", alt: "Nenek, ibu, dan anak berbincang sambil menikmati kudapan dan teh", label: "Waktu santai" },
  { image: "teman", title: "Rasa yang mempertemukan", description: "Makan siang bersama, berbagi cerita, dan tawa yang mengalir begitu saja.", alt: "Teman-teman menikmati nasi box sambil berbincang di meja makan", label: "Bersama teman" },
  { image: "berbagi", title: "Seporsi perhatian", description: "Kehangatan hadir dari hal sederhana: saling berbagi dan duduk bersama.", alt: "Kakek, ayah, dan anak berbagi hidangan di meja makan", label: "Saling berbagi" },
];
const slides = [moments[moments.length - 1], ...moments, moments[0]];

export default function FamilyGallery() {
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const drag = useRef<{ x: number; y: number; id: number; moving: boolean } | null>(null);
  const active = (position + moments.length - 1) % moments.length;
  const move = (direction: number) => setPosition(p => Math.max(0, Math.min(moments.length + 1, p + direction)));

  useEffect(() => {
    if (position !== 0 && position !== moments.length + 1) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setPosition(position === 0 ? moments.length : 1);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 750);
    return () => window.clearTimeout(timer);
  }, [position]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => { if (!document.hidden && !drag.current) move(1); }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, position]);

  useEffect(() => {
    if (animate) return;
    let second = 0;
    const frame = requestAnimationFrame(() => { second = requestAnimationFrame(() => setAnimate(true)); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(second); };
  }, [animate]);

  const finishDrag = (cancelled = false) => {
    if (!drag.current) return;
    if (!cancelled && Math.abs(offset) > 55) move(offset < 0 ? 1 : -1);
    setOffset(0);
    drag.current = null;
  };

  return (
    <section id="tentang" className="family-gallery" aria-labelledby="family-title">
      <div className="container">
        <header className="family-heading">
          <span className="family-eyebrow">MOMEN YANG INGIN DIULANG</span>
          <h2 id="family-title"><span>Cerita</span> di Meja Makan</h2>
          <p>Rasa yang menyatukan, cerita yang mendekatkan.</p>
        </header>
        <div className="family-carousel" role="region" aria-roledescription="carousel" aria-label="Foto cerita di meja makan"
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
          onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); move(e.key === "ArrowRight" ? 1 : -1); } }}
        >
          <div className={`family-viewport${offset ? " is-dragging" : ""}`}
            onPointerDown={e => { if (e.button !== 0) return; drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moving: false }; }}
            onPointerMove={e => {
              const start = drag.current;
              if (!start || start.id !== e.pointerId) return;
              const dx = e.clientX - start.x;
              const dy = e.clientY - start.y;
              if (!start.moving && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { drag.current = null; return; }
              if (!start.moving && Math.abs(dx) > 6) { start.moving = true; e.currentTarget.setPointerCapture(e.pointerId); }
              if (start.moving) setOffset(dx);
            }}
            onPointerUp={() => finishDrag()} onPointerCancel={() => finishDrag(true)}
            onLostPointerCapture={() => finishDrag(true)}
          >
            <div className="family-track" style={{ transform: `translate3d(calc(${-position * 100}% + ${offset}px), 0, 0)`, transition: !animate || offset !== 0 ? "none" : undefined }}
              onTransitionEnd={e => {
                if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
                if (position === 0 || position === moments.length + 1) { setAnimate(false); setPosition(position === 0 ? moments.length : 1); }
              }}
            >
              {slides.map((moment, index) => (
                <figure key={`${moment.image}-${index}`} className="family-main" role="group" aria-roledescription="slide" aria-label={`${(index + moments.length - 1) % moments.length + 1} dari ${moments.length}`} aria-hidden={index !== position}>
                  <Image src={`/images/moments/${moment.image}.webp`} alt={moment.alt} fill sizes="(max-width: 760px) 100vw, 1240px" draggable={false} className="family-main-image" />
                  <figcaption className="family-caption">
                    <span className="family-photo-label">{moment.label}</span>
                    <h3>{moment.title}</h3>
                    <p>{moment.description}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <button type="button" className="family-nav family-prev" aria-label="Foto sebelumnya" onClick={() => move(-1)}><Icon name="chevron" size={19} /></button>
          <button type="button" className="family-nav family-next" aria-label="Foto berikutnya" onClick={() => move(1)}><Icon name="chevron" size={19} /></button>
          <div className="family-pagination" role="group" aria-label="Pilih foto">
            {moments.map((moment, index) => <button key={moment.image} type="button" aria-label={`Foto ${index + 1}: ${moment.title}`} aria-pressed={active === index} onClick={() => setPosition(index + 1)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
