const configuredEmail = (process.env.NEXT_PUBLIC_STORE_EMAIL || "").trim();
export const feedbackEmailIsExample = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredEmail);
export const feedbackEmail = feedbackEmailIsExample ? "halo@foodstore.example" : configuredEmail;
export const feedbackEmailLink = `mailto:${encodeURIComponent(feedbackEmail)}`;

export function feedbackEmailDraft(message: string) {
  return `${feedbackEmailLink}?subject=${encodeURIComponent("Saran & Keluhan FoodStore")}&body=${encodeURIComponent(message)}`;
}
