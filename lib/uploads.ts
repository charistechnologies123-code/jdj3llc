import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/upload-config";

export function validateImageFile(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Please upload a JPG, PNG, WEBP, or GIF image.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "Images must be 200 KB or smaller.";
  }

  return null;
}

export async function storeUploadedImage(file: File, folder: string) {
  const extension = extname(file.name || "").toLowerCase() || ".jpg";
  const safeFolder = folder.replace(/[^a-zA-Z0-9/-]/g, "");
  const fileName = `${randomUUID()}${extension}`;
  const blobPath = join(safeFolder, fileName).replace(/\\/g, "/");

  const blob = await put(blobPath, file, {
    access: "public",
    contentType: file.type || undefined,
    addRandomSuffix: false,
  });

  return blob.url;
}
