export const siteConfig = {
  name: "JDJ3 African Supermarket",
  shortName: "JDJ3",
  tagline:
    "African groceries, spices, meats, and pantry staples delivered through a request-based ordering flow.",
  whatsappNumber: "+13475120770",
  whatsappDisplay: "+1 347-512-0770",
  email: "JDJ3INC@gmail.com",
  socials: {
    facebook: "https://www.facebook.com/abigail.dixon.75873?mibextid=ZbWKwL",
    instagram: "https://instagram.com/jdj3inc",
    website: "https://jdj3llc.com",
  },
};

export function buildWhatsAppUrl(message?: string) {
  const phone = siteConfig.whatsappNumber.replace(/\D+/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${query}`;
}
