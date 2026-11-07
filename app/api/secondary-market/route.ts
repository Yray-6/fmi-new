import { proxyAuthenticatedGet } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const path = qs
    ? `/api/secondary-market/?${qs}`
    : "/api/secondary-market/";
  return proxyAuthenticatedGet(path);
}
