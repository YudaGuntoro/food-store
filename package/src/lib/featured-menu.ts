import { products } from "./catalog";

// Editorial demo selections, editable independently from the full catalog.
const selections = {
  new: [
    "kebuli-ayam",
    "snack-klasik",
    "tumpeng-spesial",
    "box-keluarga",
    "kebuli-berbagi",
    "snack-rapat",
  ],
  bestseller: [
    "box-ayam",
    "tumpeng-spesial",
    "kebuli-ayam",
    "snack-klasik",
    "tumpeng-acara",
    "box-keluarga",
  ],
} as const;
export const featuredMenus = {
  new: selections.new.flatMap(
    (id) => products.find((product) => product.id === id) ?? [],
  ),
  bestseller: selections.bestseller.flatMap(
    (id) => products.find((product) => product.id === id) ?? [],
  ),
};
