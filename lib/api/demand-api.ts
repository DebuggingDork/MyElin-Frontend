/**
 * Demand Preview API Client
 * 
 * Connects to backend demand dynamics engine to show real-time buyer interest
 * as users adjust their allocation sliders.
 */

import { apiClient } from './client';

export interface DemandPreviewRequest {
  company_id: string;
  quarter: number;
  
  // Marketing spend in lakhs
  google_ads?: number;
  meta_ads?: number;
  social_influencer?: number;
  content_seo?: number;
  events_pr?: number;
  email?: number;
  direct_marketing?: number;
  referral?: number;
  
  // Optional boosts for "what if" scenarios
  brand_boost?: number;
  innovation_boost?: number;
  quality_boost?: number;
}

export interface DemandPreviewResponse {
  addressable_demand_units: number;
  total_market_demand: number;
  our_market_share_potential: string;
  competitive_position_score: string;
  product_pull_score: string;
  rival_total_strength: string;
  marketing_voice_index: string;
  guidance_message: string;
}

export interface DetailedDemandResponse {
  addressable_demand_units: number;
  total_market_demand: number;
  attractive_share_pct: string;
  
  // Lead breakdown
  google_leads: number;
  meta_leads: number;
  social_leads: number;
  content_leads: number;
  events_leads: number;
  email_leads: number;
  direct_leads: number;
  total_raw_leads: number;
  effective_leads: number;
  
  // Product metrics
  product_pull_score: string;
  conversion_ceiling_pct: string;
  expected_conversion_pct: string;
  
  // Competitive position
  our_strength: string;
  rival_strength: string;
}

/**
 * Get quick addressable demand estimate
 * Use this for real-time updates as user adjusts sliders
 */
export async function previewAddressableDemand(
  request: DemandPreviewRequest
): Promise<DemandPreviewResponse> {
  const response = await apiClient.post<DemandPreviewResponse>(
    '/api/demand/preview',
    request
  );
  return response.data;
}

/**
 * Get detailed demand breakdown with channel-by-channel analysis
 * Use this for dashboard display and detailed planning view
 */
export async function getDetailedDemand(
  request: DemandPreviewRequest
): Promise<DetailedDemandResponse> {
  const response = await apiClient.post<DetailedDemandResponse>(
    '/api/demand/detailed',
    request
  );
  return response.data;
}

/**
 * Format number with commas for display
 */
export function formatBuyerCount(count: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(count));
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(pct: string): number {
  return parseFloat(pct.replace('%', ''));
}
