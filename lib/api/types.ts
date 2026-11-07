export interface ApiUserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
  country?: string;
  address?: string;
  profile_photo?: string | null;
  is_verified: boolean;
  member_since: string;
  investor_type?: string;
  investor_type_display: string;
  risk_tolerance?: string;
  risk_tolerance_display: string;
  investment_preferences?: unknown;
  portfolio_value: string;
  total_invested: string;
  active_investments_count: string;
}

export interface ApiLoginResponse {
  message: string;
  user: ApiUserProfile;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface ApiNetworkPortfolioOverview {
  key_metrics: {
    total_portfolio_return: number;
    annualized_irr: number;
    portfolio_value: number;
    distributions_received: number;
  };
  sector_performance: Array<{
    sector: string;
    sector_display: string;
    amount: number;
    percentage: number;
  }>;
  investment_performance: Array<{
    name: string;
    value: number;
    percentage: number;
    return_percentage: number;
  }>;
}

export interface InvestmentListItem {
  id: number;
  name: string;
  status: string;
  status_display: string;
  sector: string;
  sector_display: string;
  current_value: string;
  total_invested: string;
  unrealized_gain: string;
  unrealized_gain_percentage: string;
  investment_date: string;
  moic: string;
  opportunity_id?: number | null;
}

export interface InvestmentDetail extends InvestmentListItem {
  manager?: string;
  fund_size?: string | null;
  unfunded_commitment?: string;
  expected_horizon_years?: number | null;
  fund_vintage?: number | null;
  progress_percentage?: string;
  calculated_irr?: number | null;
  target_irr?: string | null;
  expected_end_date?: string | null;
  capital_activities?: ApiCapitalActivity[];
}

export interface OwnershipTransfer {
  id: number;
  investment: number;
  investment_name?: string;
  from_user_email?: string;
  to_user_email?: string | null;
  to_user?: number | null;
  to_email?: string;
  to_name?: string;
  recipient?: string;
  transfer_type: string;
  transfer_type_display?: string;
  percentage?: string | null;
  transfer_amount: string;
  transfer_fee?: string;
  net_amount?: string;
  reason?: string;
  status: string;
  status_display?: string;
  initiated_date?: string;
  estimated_completion_date?: string | null;
  documents?: TransferDocument[];
}

export interface TransferDocument {
  id: number;
  document_type?: string;
  document_type_display?: string;
  file?: string;
  file_url?: string | null;
  uploaded_at?: string;
}

export interface TransferCreateRequest {
  investment: number;
  to_user?: number | null;
  to_email?: string;
  to_name?: string;
  transfer_type: "FULL" | "PARTIAL";
  percentage?: string | null;
  transfer_amount: string;
  reason: string;
  status?: "DRAFT" | "PENDING";
}

export interface SecondaryMarketInterest {
  id: number;
  transfer_id?: number;
  transfer?: number;
  buyer_email?: string;
  amount: string;
  interest_date?: string;
  status: string;
  status_display?: string;
  created_at?: string;
}

export interface InvestorInterest {
  id: number;
  opportunity: number;
  opportunity_title?: string;
  amount: string;
  investment_date: string;
  status: string;
  status_display?: string;
  created_at?: string;
}

export interface ApiCapitalActivity {
  id: number;
  investment: {
    id: number;
    name: string;
  };
  activity_type: string;
  activity_type_display: string;
  amount: string;
  date: string;
  details?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  investorTypeDisplay: string;
  initials: string;
}

export interface ApiMarketplaceTag {
  id: number;
  tag_name: string;
  tag_type: string;
  tag_type_display: string;
}

export interface ApiMarketplaceOpportunity {
  id: number;
  title: string;
  description: string;
  sector: string;
  sector_display: string;
  status: "NEW" | "ACTIVE" | "CLOSING_SOON" | "CLOSED" | string;
  status_display: string;
  min_investment: string;
  fund_manager: string;
  stage: string;
  target_raise_amount: string;
  current_raised_amount: string;
  target_irr?: string | null;
  investment_term_years: number;
  investment_type: string;
  investment_type_display: string;
  rating: string;
  investors_count: number;
  funding_progress_percentage: string;
  remaining_amount: string;
  is_featured: boolean;
  tags: ApiMarketplaceTag[];
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | string;
  risk_level_display?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiOpportunityDetail extends ApiMarketplaceOpportunity {
  detailed_description: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | string;
  risk_level_display: string;
  payout_frequency: string;
  payout_frequency_display: string;
  currency: string;
  verification_type: string;
  verification_type_display: string;
  contact_phone: string;
  contact_email: string;
  location: string;
  investment_requirements: string;
  documents?: OpportunityDocument[];
  disclaimer?: string;
  monthly_revenue?: string | null;
  net_cash_flow?: string | null;
}

export interface OpportunityDocument {
  id: number;
  title: string;
  file?: string;
  file_url?: string | null;
  document_type?: string;
  document_type_display?: string;
  uploaded_at?: string;
}

export interface ApiSecondaryMarketListing {
  id: number;
  investment: number;
  investment_name: string;
  investment_slug?: string;
  investment_sector: string;
  investment_sector_display: string;
  opportunity_id: number | null;
  opportunity_title: string | null;
  opportunity_target_irr: string | null;
  opportunity_min_investment: string | null;
  opportunity_investment_term_years: number | null;
  opportunity_risk_level: string | null;
  opportunity_payout_frequency: string | null;
  transfer_type: "FULL" | "PARTIAL" | string;
  transfer_type_display: string;
  is_partial: string;
  percentage: string | null;
  transfer_amount: string;
  transfer_fee: string;
  net_amount: string;
  reason: string;
  seller_display_name: string;
  status: string;
  status_display: string;
  listed_at: string;
  estimated_completion_date: string | null;
}

/** Investor Network — `/api/accounts/network/` */

export type ApiNetworkConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "rejected"
  | "self"
  | null;

export type ApiInvestorCategory =
  | "FAMILY_OFFICE"
  | "ANGEL"
  | "VC"
  | "PE"
  | "INSTITUTIONAL"
  | "INDIVIDUAL"
  | "";

export interface ApiInvestorProfile {
  id: number;
  display_name: string;
  investor_category: ApiInvestorCategory;
  investor_category_display: string;
  location: string;
  investments_count: number;
  total_invested: number;
  current_value: number;
  preferred_sectors: string[];
  bio?: string;
  connection_status?: ApiNetworkConnectionStatus;
}

export interface ApiInvestorDirectoryResponse {
  investors: ApiInvestorProfile[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiNetworkConnection {
  id: number;
  investor: ApiInvestorProfile;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface ApiInvestorRecentInvestment {
  name: string;
  sector: string;
  invested: number;
  current_value: number;
  performance: number;
  date: string;
}

export interface ApiInvestorPortfolioOverview {
  total_value: number;
  sector_allocation: Record<string, number>;
  investments_count: number;
}

export interface ApiInvestorProfileResponse {
  profile: ApiInvestorProfile;
  portfolio_overview: ApiInvestorPortfolioOverview;
  recent_investments: ApiInvestorRecentInvestment[];
  connection_status: ApiNetworkConnectionStatus;
}
