// src/lib/lemonSqueezy.ts

export const LEMON_SQUEEZY_CONFIG = {
  storeId: import.meta.env.VITE_LEMONSQUEEZY_STORE_ID,
  products: {
    premiumSlots: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_ID,
  },
}

/**
 * Opens a Lemon Squeezy checkout overlay
 * Test mode is automatic when your store is in test mode
 */
export function openCheckout(variantId: string, userEmail: string, userId: string) {
  const url = new URL(`https://flickra.lemonsqueezy.com/checkout/buy/${variantId}`)
  url.searchParams.set('checkout[email]', userEmail)
  window.open(url.toString(), '_blank')
}

/** Call once in main.tsx to load the Lemon Squeezy embed script */
export function loadLemonSqueezyScript() {
  if (document.getElementById('lemon-js')) return
  const script = document.createElement('script')
  script.id = 'lemon-js'
  script.src = 'https://app.lemonsqueezy.com/js/lemon.js'
  script.defer = true
  document.body.appendChild(script)
}