"use client";

import type { ChangeEvent } from "react";
import { useId, useState } from "react";

import { MAX_UPLOAD_BYTES } from "@/lib/upload-config";

type Props = {
  label: string;
  folder: "products" | "avatars" | "testimonials";
  value?: string;
  onChange: (value: string) => void;
};

export function UploadedImageField({ label, folder, value = "", onChange }: Props) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputId = useId();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage("Images must be 200 KB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setMessage("");

    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", folder);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as { path?: string; message?: string };

      if (!response.ok || !result.path) {
        setMessage(result.message ?? "Upload failed.");
        return;
      }

      onChange(result.path);
      setMessage("Upload complete.");
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
      />
      <p className="text-xs text-slate-500">Upload an image file up to 200 KB.</p>
      {value ? (
        <div className="rounded-2xl border border-slate-200 bg-stone-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-28 w-28 rounded-xl object-cover" />
        </div>
      ) : null}
      {message ? <p className="text-sm text-slate-600">{uploading ? "Uploading..." : message}</p> : null}
    </div>
  );
}
