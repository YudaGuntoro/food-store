import type { Metadata } from "next";
import ContentPage from "@/components/content-page";
import OrderingSteps from "@/components/ordering-steps";

export const metadata: Metadata = {
  title: "Cara Pesan | FoodStore",
  description: "Lima langkah mudah memesan di FoodStore, dari memilih menu hingga menerima hidangan.",
};

export default function OrderingPage() {
  return <ContentPage active="ordering"><OrderingSteps pageHeading /></ContentPage>;
}
