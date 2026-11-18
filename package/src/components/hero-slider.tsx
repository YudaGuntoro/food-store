"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { heroSlides } from "@/lib/hero-slides";
import type { Category } from "@/lib/catalog";
import Icon from "./icon";

export default function HeroSlider({
  onCategory,
}: {
  onCategory: (category: Category) => void;
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    lastX: number;
    time: number;
    velocity: number;
    width: number;
    locked: boolean;
  } | null>(null);
  const swiped = useRef(false);
  const total = heroSlides.length;
  const goTo = (index: number) => setActive((index + total) % total);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    swiped.current = false;
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: event.timeStamp,
      velocity: 0,
      width: event.currentTarget.clientWidth,
      locked: false,
    };
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const delta = event.clientX - current.x;
    const vertical = event.clientY - current.y;
    if (!current.locked) {
      if (
        event.pointerType === "touch" &&
        Math.abs(vertical) > 8 &&
        Math.abs(vertical) > Math.abs(delta)
      ) {
        gesture.current = null;
        return;
      }
      if (Math.abs(delta) < 6) return;
      current.locked = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (event.cancelable) event.preventDefault();
    const elapsed = event.timeStamp - current.time;
    if (elapsed > 0)
      current.velocity = (event.clientX - current.lastX) / elapsed;
    current.lastX = event.clientX;
    current.time = event.timeStamp;
    swiped.current = true;
    const outsideEdge =
      (active === 0 && delta > 0) || (active === total - 1 && delta < 0);
    setDragOffset(outsideEdge ? delta * 0.22 : delta);
  }
  function finishDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    setDragOffset(0);
    if (cancelled || !current.locked) return;
    const delta = event.clientX - current.x;
    const freshVelocity =
      event.timeStamp - current.time < 100 ? current.velocity : 0;
    const flick =
      Math.abs(delta) > 20 &&
      Math.abs(freshVelocity) > 0.45 &&
      Math.sign(freshVelocity) === Math.sign(delta);
    if (Math.abs(delta) > Math.min(110, current.width * 0.16) || flick) {
      setActive((index) =>
        Math.max(0, Math.min(total - 1, index + (delta < 0 ? 1 : -1))),
      );
    }
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setReducedMotion(preference.matches);
    const visibilityChange = () => setHidden(document.hidden);
    motionChange();
    visibilityChange();
    preference.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      preference.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, []);

  useEffect(() => {
    if (hovered || focused || reducedMotion || hidden || dragging) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % total),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [active, hovered, focused, reducedMotion, hidden, dragging, total]);

  return (
    <section
      className="hero hero-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pilihan banner FoodStore"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          goTo(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
    >
      <h1 className="sr-only">
        Setiap momen, jadi lebih nikmat bersama FoodStore.
      </h1>
      <div
        className={`hero-stage ${dragging ? "is-dragging" : ""}`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={(event) => finishDrag(event)}
        onPointerCancel={(event) => finishDrag(event, true)}
        onLostPointerCapture={(event) => finishDrag(event, true)}
        onDragStart={(event) => event.preventDefault()}
      >
        <div
          className="hero-track"
          style={{
            transform: `translate3d(calc(-${active * 100}% + ${dragOffset}px), 0, 0)`,
          }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="hero-slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} dari ${total}: ${slide.title}`}
              aria-hidden={index !== active}
            >
              <a
                href={slide.href}
                tabIndex={index === active ? 0 : -1}
                onClick={(event) => {
                  if (swiped.current && event.detail !== 0) {
                    event.preventDefault();
                    swiped.current = false;
                    return;
                  }
                  if ("category" in slide) onCategory(slide.category);
                  else onCategory("Semua Menu");
                }}
              >
                <picture>
                  <source
                    media="(max-width: 600px)"
                    srcSet={slide.mobileImage}
                  />
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    width={1600}
                    height={610}
                    sizes="100vw"
                    priority={index === 0}
                    loading={index === 0 ? undefined : "eager"}
                    draggable={false}
                  />
                </picture>
              </a>
            </div>
          ))}
        </div>
      </div>
      <button
        className="slider-arrow slider-previous"
        aria-label="Banner sebelumnya"
        onClick={() => goTo(active - 1)}
      >
        <Icon
          name="chevron"
          size={22}
          style={{ transform: "rotate(180deg)" }}
        />
      </button>
      <button
        className="slider-arrow slider-next"
        aria-label="Banner berikutnya"
        onClick={() => goTo(active + 1)}
      >
        <Icon name="chevron" size={22} />
      </button>
      <div className="slider-controls">
        <div className="slider-dots" aria-label="Pilih banner">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Tampilkan banner ${index + 1}: ${slide.title}`}
              aria-pressed={active === index}
              onClick={() => goTo(index)}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
      <p
        className="sr-only"
        aria-live={focused ? "polite" : "off"}
        aria-atomic="true"
      >
        Banner {active + 1} dari {total}: {heroSlides[active].title}
      </p>
    </section>
  );
}
