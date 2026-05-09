import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

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
  const diskFolder = join(process.cwd(), "public", "uploads", safeFolder);
  const diskPath = join(diskFolder, fileName);

  await mkdir(diskFolder, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, bytes);

  return `/uploads/${safeFolder}/${fileName}`;
}
