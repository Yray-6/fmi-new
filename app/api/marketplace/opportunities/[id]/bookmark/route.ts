import {
  proxyAuthenticatedDelete,
  proxyAuthenticatedPost,
} from "@/lib/api/proxy";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyAuthenticatedPost(
    `/api/marketplace/opportunities/${id}/bookmark/`,
  );
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyAuthenticatedDelete(
    `/api/marketplace/opportunities/${id}/remove_bookmark/`,
  );
}
