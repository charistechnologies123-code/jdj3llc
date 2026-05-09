import { cookies } from "next/headers";
import { z } from "zod";

import { getSessionFromCookies } from "@/lib/session";
import { storeUploadedImage, validateImageFile } from "@/lib/uploads";

const folderSchema = z.enum(["products", "avatars", "testimonials"]);

export async function POST(request: Request) {
  const session = getSessionFromCookies(await cookies());
  if (!session) {
    return Response.json({ message: "Please sign in before uploading images." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = folderSchema.safeParse(formData.get("folder"));

  if (!(file instanceof File)) {
    return Response.json({ message: "Please choose an image to upload." }, { status: 400 });
  }

  if (!folder.success) {
    return Response.json({ message: "Upload folder is invalid." }, { status: 400 });
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return Response.json({ message: validationError }, { status: 400 });
  }

  const path = await storeUploadedImage(file, folder.data);
  return Response.json({ path });
}
