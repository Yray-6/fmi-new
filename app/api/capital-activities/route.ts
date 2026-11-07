import { proxyAuthenticatedGet } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const path = page
    ? `/api/capital-activities/?page=${encodeURIComponent(page)}`
    : "/api/capital-activities/";
  return proxyAuthenticatedGet(path);
}
