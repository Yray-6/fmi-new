import { proxyAuthenticatedGet } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");
  const path = page
    ? `/api/investments/?page=${encodeURIComponent(page)}`
    : "/api/investments/";
  return proxyAuthenticatedGet(path);
}
