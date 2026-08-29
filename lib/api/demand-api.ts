/**
 * Demand Preview API Client
 * 
 * Connects to backend demand dynamics engine to show real-time buyer interest
 * as users adjust their allocation sliders.
 */

import { api } from './client';
import type { DemandPreviewRequest, DemandPreviewResponse, DetailedDemandResponse } from './types';

/**
 * Get quick addressable demand estimate
 * Use this for real-time updates as user adjusts sliders
 */
export async function previewAddressableDemand(
  request: DemandPreviewRequest
): Promise<DemandPreviewResponse> {
  return api.previewDemand(request);
}

/**
 * Get detailed demand breakdown with channel-by-channel analysis
 * Use this for dashboard display and detailed planning view
 */
export async function getDetailedDemand(
  request: DemandPreviewRequest
): Promise<DetailedDemandResponse> {
  return api.getDetailedDemand(request);
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

// Re-export types for convenience
export type { DemandPreviewRequest, DemandPreviewResponse, DetailedDemandResponse };
