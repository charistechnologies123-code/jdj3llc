import { Facebook, Globe, Instagram, Mail, MessageCircleMore } from "lucide-react";

import { buildWhatsAppUrl, siteConfig } from "@/lib/site";

export function StoreFooter() {
  return (
    <>
      <footer className="mt-16 border-t border-[#edd8bf] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h2 className="text-lg font-black">JDJ3 LLC</h2>
            <p className="mt-3 text-sm text-slate-600">{siteConfig.tagline}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
              Need to know
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>Delivery timeline: 3-5 days</li>
              <li>Payments confirmed offline after admin review</li>
              <li>Returns are not supported</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-orange-500" />{siteConfig.whatsappDisplay}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-500" />{siteConfig.email}</li>
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-orange-500" />JDJ3LLC.com</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Follow</h3>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
              <a href={siteConfig.socials.facebook} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={siteConfig.socials.instagram} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 active:scale-[0.98]" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <a
        href={buildWhatsAppUrl("Hello JDJ3, I would like to make an inquiry.")}
        className="fixed bottom-5 right-5 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-slate-900/20 transition duration-200 hover:-translate-y-1 hover:bg-emerald-600 active:scale-[0.96]"
        aria-label="Chat on WhatsApp"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.86 11.86 0 0012.04 0C5.52 0 .22 5.29.22 11.79c0 2.08.54 4.12 1.57 5.92L0 24l6.47-1.7a11.84 11.84 0 005.57 1.41h.01c6.51 0 11.82-5.29 11.82-11.79 0-3.15-1.23-6.11-3.35-8.44zm-8.48 18.2h-.01a9.8 9.8 0 01-4.99-1.36l-.36-.21-3.84 1.01 1.02-3.74-.24-.38a9.75 9.75 0 01-1.5-5.21c0-5.4 4.44-9.79 9.91-9.79 2.64 0 5.11 1.02 6.97 2.88a9.67 9.67 0 012.88 6.91c0 5.4-4.45 9.78-9.84 9.78zm5.37-7.34c-.29-.15-1.72-.84-1.99-.94-.27-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.23-.45-2.35-1.43-.87-.76-1.46-1.7-1.63-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.37-.02-.51-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.49-.65-.5h-.55c-.19 0-.49.07-.74.34-.25.27-.97.94-.97 2.29 0 1.35.99 2.66 1.13 2.84.15.19 1.95 2.98 4.72 4.17.66.28 1.18.45 1.58.58.67.21 1.28.18 1.76.11.54-.08 1.72-.7 1.97-1.38.24-.67.24-1.25.17-1.38-.07-.12-.26-.19-.55-.34z" />
        </svg>
      </a>
    </>
  );
}
