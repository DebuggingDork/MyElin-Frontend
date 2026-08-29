/**
 * Buyer Interest Display Component
 * 
 * Shows dynamic "X buyers interested" that updates as investment decisions change.
 * This is the visual manifestation of the demand dynamics engine.
 */

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { 
  previewAddressableDemand, 
  formatBuyerCount,
  type DemandPreviewRequest 
} from '@/lib/api/demand-api';
import { useDebounce } from '@/hooks/use-debounce';

interface BuyerInterestDisplayProps {
  companyId: string;
  quarter: number;
  marketingAllocation: {
    googleAds: number;
    metaAds: number;
    socialInfluencer: number;
    contentSeo: number;
    eventsPr: number;
    email: number;
    directMarketing: number;
    referral: number;
  };
  className?: string;
  showDetails?: boolean;
}

export function BuyerInterestDisplay({
  companyId,
  quarter,
  marketingAllocation,
  className = '',
  showDetails = true,
}: BuyerInterestDisplayProps) {
  const [buyerCount, setBuyerCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the allocation to avoid hammering the API as user drags sliders
  const debouncedAllocation = useDebounce(marketingAllocation, 500);

  useEffect(() => {
    const fetchBuyerInterest = async () => {
      if (!companyId || quarter < 1) return;

      setIsLoading(true);
      try {
        const request: DemandPreviewRequest = {
          company_id: companyId,
          quarter: quarter,
          google_ads: debouncedAllocation.googleAds || 0,
          meta_ads: debouncedAllocation.metaAds || 0,
          social_influencer: debouncedAllocation.socialInfluencer || 0,
          content_seo: debouncedAllocation.contentSeo || 0,
          events_pr: debouncedAllocation.eventsPr || 0,
          email: debouncedAllocation.email || 0,
          direct_marketing: debouncedAllocation.directMarketing || 0,
          referral: debouncedAllocation.referral || 0,
        };

        const response = await previewAddressableDemand(request);
        
        setBuyerCount(response.addressable_demand_units);
      } catch (error) {
        console.error('Failed to fetch buyer interest:', error);
        // Don't clear existing data on error - better to show stale data than nothing
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyerInterest();
  }, [companyId, quarter, debouncedAllocation]);

  if (buyerCount === null) {
    return (
      <div className={`animate-pulse bg-stone-100 rounded-lg p-6 ${className}`}>
        <div className="h-8 bg-stone-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-stone-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`bg-stone-50 border-l-4 border-stone-300 rounded p-6 ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wide text-stone-500 font-medium mb-2">
          Before you allocate
        </p>
        <h3 className="text-sm text-stone-700 leading-relaxed">
          Roughly how many buyers you could reach this quarter
        </h3>
      </div>

      {/* Main buyer count */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-5xl font-bold text-stone-900 font-serif">
          {formatBuyerCount(buyerCount)}
        </span>
        <span className="text-sm text-stone-600">
          buyers, if you fund marketing and pricing well
        </span>
      </div>

      {/* Guidance text */}
      <p className="text-xs text-stone-500 leading-relaxed italic border-t border-stone-200 pt-3">
        Size Sales capacity and how much you plan to produce against this number, not against how much cash you have. 
        It's an estimate from where the company stands right now — the real figure depends on what you actually decide, 
        and will differ once the quarter closes.
      </p>

      {/* Loading indicator during updates */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
          <div className="animate-spin h-3 w-3 border-2 border-stone-400 border-t-transparent rounded-full" />
          <span>Recalculating...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for sidebar or tight spaces
 */
export function BuyerInterestCompact({
  companyId,
  quarter,
  marketingAllocation,
  className = '',
}: BuyerInterestDisplayProps) {
  const [buyerCount, setBuyerCount] = useState<number | null>(null);

  const debouncedAllocation = useDebounce(marketingAllocation, 500);

  useEffect(() => {
    const fetchBuyerInterest = async () => {
      if (!companyId || quarter < 1) return;

      try {
        const request: DemandPreviewRequest = {
          company_id: companyId,
          quarter: quarter,
          google_ads: debouncedAllocation.googleAds || 0,
          meta_ads: debouncedAllocation.metaAds || 0,
          social_influencer: debouncedAllocation.socialInfluencer || 0,
          content_seo: debouncedAllocation.contentSeo || 0,
          events_pr: debouncedAllocation.eventsPr || 0,
          email: debouncedAllocation.email || 0,
          direct_marketing: debouncedAllocation.directMarketing || 0,
          referral: debouncedAllocation.referral || 0,
        };

        const response = await previewAddressableDemand(request);
        setBuyerCount(response.addressable_demand_units);
      } catch (error) {
        console.error('Failed to fetch buyer interest:', error);
      }
    };

    fetchBuyerInterest();
  }, [companyId, quarter, debouncedAllocation]);

  if (buyerCount === null) {
    return (
      <div className={`flex items-center gap-2 text-stone-500 ${className}`}>
        <Users className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="h-5 w-5 text-rose-700" />
      <div>
        <p className="text-2xl font-bold font-mono text-stone-900">
          {formatBuyerCount(buyerCount)}
        </p>
        <p className="text-xs text-stone-600">buyers interested</p>
      </div>
    </div>
  );
}
