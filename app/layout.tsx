import type { Metadata } from "next";
import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { AuthProvider } from "@/components/auth-provider";
import { AppToaster } from "@/components/app-toaster";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: "JDJ3 African Supermarket",
  description: "Request-based African grocery ordering on a Vercel-ready Next.js stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-stone-50 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <AppToaster />
            <AppChrome>{children}</AppChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
