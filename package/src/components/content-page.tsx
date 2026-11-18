import type { ReactNode } from "react";
import Storefront from "./storefront";
import styles from "./content-page.module.css";

const routes = { deals: "/paket-hemat", kitchen: "/dapur-foodstore", ordering: "/cara-pesan" };

export default function ContentPage({ active, children }: { active: keyof typeof routes; children: ReactNode }) {
  return <Storefront activePage={routes[active]}><div className={styles.page}>{children}</div></Storefront>;
}
