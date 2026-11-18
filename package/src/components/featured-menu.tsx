"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { featuredMenus } from "@/lib/featured-menu";
import { rupiah, type Product } from "@/lib/catalog";
import Icon from "./icon";

const tabs = [
  { id: "new", label: "New Menu" },
  { id: "bestseller", label: "Best Seller" },
] as const;
type MenuTab = (typeof tabs)[number]["id"];

export default function FeaturedMenu({
  onSelect,
}: {
  onSelect: (product: Product) => void;
}) {
  const [tab, setTab] = useState<MenuTab>("new");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const label = tabs.find((item) => item.id === tab)!.label;

  return (
    <section
      className="featured-menu"
      id="menu-unggulan"
      aria-labelledby="featured-heading"
    >
      <div className="container">
        <div className="featured-heading">
          <h2 id="featured-heading">
            Temukan Menu <span>Favoritmu</span>
          </h2>
        </div>
        <div
          className="featured-tabs"
          role="tablist"
          aria-label="Pilihan menu unggulan"
        >
          {tabs.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              id={`featured-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`featured-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight" || event.key === "ArrowLeft")
                  next =
                    (index +
                      (event.key === "ArrowRight" ? 1 : -1) +
                      tabs.length) %
                    tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                setTab(tabs[next].id);
                tabRefs.current[next]?.focus();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tabs.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`featured-panel-${item.id}`}
            aria-labelledby={`featured-tab-${item.id}`}
            hidden={tab !== item.id}
            tabIndex={0}
          >
            <div className="featured-panel-heading">
              <span>MENU PILIHAN</span>
              <h3>{item.label}</h3>
            </div>
            <div className="featured-dishes">
              {featuredMenus[item.id].map((product) => (
                <article className="featured-dish" key={product.id}>
                  <button
                    className="featured-dish-photo"
                    onClick={() => onSelect(product)}
                    aria-label={`Lihat ${product.name} dari ${item.label}`}
                  >
                    <Image
                      src={`/images/food/${product.image}.webp`}
                      alt={product.name}
                      fill
                      sizes="(max-width: 600px) 42vw, (max-width: 900px) 230px, 250px"
                    />
                    <span className="featured-photo-hint">
                      Lihat detail <Icon name="arrow" size={16} />
                    </span>
                  </button>
                  <h4>
                    <button onClick={() => onSelect(product)}>
                      {product.name}
                    </button>
                  </h4>
                  <p>{product.description.split(".")[0]}.</p>
                  <span className="featured-serving">{product.serving}</span>
                  <strong className="featured-price">
                    {rupiah(product.price)}
                  </strong>
                </article>
              ))}
            </div>
          </div>
        ))}
        <div className="featured-footer">
          <a href="#menu" className="featured-all-menu">
            Jelajahi semua menu <Icon name="arrow" size={17} />
          </a>
          <p>Menu dan harga contoh · Foto ilustrasi AI</p>
        </div>
        <span className="sr-only" aria-live="polite">
          Menampilkan {label}
        </span>
      </div>
    </section>
  );
}
