import Image from "next/image";

export default function ReservationSticker({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="reservation-sticker" onClick={onClick} aria-label="Reservasi catering FoodStore">
      <Image src="/images/ui/reservasi-ceria-transparent.webp" alt="" width={600} height={600} sizes="(max-width: 600px) 128px, 174px" draggable={false} />
    </button>
  );
}
