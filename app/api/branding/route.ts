import { getBranding } from "@/lib/admin";

export async function GET() {
  return Response.json(await getBranding());
}
