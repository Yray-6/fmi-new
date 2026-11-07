import { proxyAuthenticatedGet } from "@/lib/api/proxy";

export async function GET() {
  return proxyAuthenticatedGet("/api/portfolio/overview/");
}
