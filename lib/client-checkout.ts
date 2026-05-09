const CHECKOUT_MODE_KEY = "jdj3-checkout-mode";

function hasWindow() {
  return typeof window !== "undefined";
}

export function enableGuestCheckout() {
  if (!hasWindow()) return;
  window.localStorage.setItem(CHECKOUT_MODE_KEY, "guest");
}

export function clearGuestCheckout() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(CHECKOUT_MODE_KEY);
}

export function isGuestCheckoutEnabled() {
  if (!hasWindow()) return false;
  return window.localStorage.getItem(CHECKOUT_MODE_KEY) === "guest";
}
