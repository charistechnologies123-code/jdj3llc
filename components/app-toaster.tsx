"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "18px",
          border: "1px solid #fed7aa",
          background: "#fff7ed",
          color: "#0f172a",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
