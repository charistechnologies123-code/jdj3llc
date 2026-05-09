"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

export function PasswordField({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1 flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 focus-within:border-orange-300 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.12)]">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          className="block w-full border-0 px-4 py-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 active:scale-95"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
