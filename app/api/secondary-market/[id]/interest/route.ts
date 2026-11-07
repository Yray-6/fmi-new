import { proxyAuthenticatedPost } from "@/lib/api/proxy";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyAuthenticatedPost(
    `/api/secondary-market/${id}/express_interest/`,
  );
}
