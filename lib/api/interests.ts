import { bffGet, bffPatch, bffPost } from "./client";
import { fetchAllPages } from "./pagination";
import type { InvestorInterest } from "./types";

export function fetchInvestorInterests() {
  return fetchAllPages<InvestorInterest>("/api/bff/marketplace/investor-interest");
}

export function fetchInvestorInterest(id: string) {
  return bffGet<InvestorInterest>(
    `/api/bff/marketplace/investor-interest/${id}`,
  );
}

export function createInvestorInterest(input: {
  opportunity: number;
  amount: string;
  investmentDate: string;
}) {
  return bffPost<InvestorInterest>("/api/bff/marketplace/investor-interest", {
    opportunity: input.opportunity,
    amount: input.amount,
    investment_date: input.investmentDate,
  });
}

export function updateInvestorInterest(
  id: string,
  input: { amount?: string; investmentDate?: string },
) {
  return bffPatch<InvestorInterest>(
    `/api/bff/marketplace/investor-interest/${id}`,
    {
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.investmentDate !== undefined
        ? { investment_date: input.investmentDate }
        : {}),
    },
  );
}

export function cancelInvestorInterest(id: string) {
  return bffPost<InvestorInterest>(
    `/api/bff/marketplace/investor-interest/${id}/cancel`,
    {},
  );
}
