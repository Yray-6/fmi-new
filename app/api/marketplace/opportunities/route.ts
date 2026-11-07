import { proxyAuthenticatedGet } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const path = qs
    ? `/api/marketplace/opportunities/?${qs}`
    : "/api/marketplace/opportunities/";
  return proxyAuthenticatedGet(path);
}
