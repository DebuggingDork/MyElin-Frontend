/**
 * Detailed Demand Breakdown Component
 * 
 * Shows channel-by-channel lead generation and conversion funnel.
 * Helps users understand which investments are driving buyer interest.
 */

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getDetailedDemand, 
  formatBuyerCount,
  parsePercentage,
  type DemandPreviewRequest,
  type DetailedDemandResponse 
} from '@/lib/api/demand-api';
import { useDebounce } from '@/hooks/use-debounce';

interface DemandBreakdownProps {
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
}

interface ChannelData {
  name: string;
  leads: number;
  spend: number;
  costPerLead: number;
  color: string;
}

export function DemandBreakdown({
  companyId,
  quarter,
  marketingAllocation,
  className = '',
}: DemandBreakdownProps) {
  const [demandData, setDemandData] = useState<DetailedDemandResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedAllocation = useDebounce(marketingAllocation, 800);

  useEffect(() => {
    const fetchDetailedDemand = async () => {
      if (!companyId || quarter < 1) return;

      setIsLoading(true);
      setError(null);

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

        const response = await getDetailedDemand(request);
        setDemandData(response);
      } catch (err) {
        console.error('Failed to fetch detailed demand:', err);
        setError('Unable to load demand breakdown. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedDemand();
  }, [companyId, quarter, debouncedAllocation]);

  if (isLoading && !demandData) {
    return (
      <div className={`bg-white rounded-lg border border-stone-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-stone-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-stone-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-rose-50 border border-rose-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-rose-900">Error loading demand data</h3>
            <p className="text-sm text-rose-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!demandData) return null;

  // Prepare channel data
  const channels: ChannelData[] = [
    {
      name: 'Google Ads',
      leads: demandData.google_leads,
      spend: debouncedAllocation.googleAds,
      costPerLead: debouncedAllocation.googleAds > 0 
        ? (debouncedAllocation.googleAds * 100000) / Math.max(1, demandData.google_leads)
        : 0,
      color: 'bg-blue-500',
    },
    {
      name: 'Meta Ads',
      leads: demandData.meta_leads,
      spend: debouncedAllocation.metaAds,
      costPerLead: debouncedAllocation.metaAds > 0
        ? (debouncedAllocation.metaAds * 100000) / Math.max(1, demandData.meta_leads)
        : 0,
      color: 'bg-indigo-500',
    },
    {
      name: 'Social & Influencer',
      leads: demandData.social_leads,
      spend: debouncedAllocation.socialInfluencer,
      costPerLead: debouncedAllocation.socialInfluencer > 0
        ? (debouncedAllocation.socialInfluencer * 100000) / Math.max(1, demandData.social_leads)
        : 0,
      color: 'bg-purple-500',
    },
    {
      name: 'Content & SEO',
      leads: demandData.content_leads,
      spend: debouncedAllocation.contentSeo,
      costPerLead: debouncedAllocation.contentSeo > 0
        ? (debouncedAllocation.contentSeo * 100000) / Math.max(1, demandData.content_leads)
        : 0,
      color: 'bg-emerald-500',
    },
    {
      name: 'Events & PR',
      leads: demandData.events_leads,
      spend: debouncedAllocation.eventsPr,
      costPerLead: debouncedAllocation.eventsPr > 0
        ? (debouncedAllocation.eventsPr * 100000) / Math.max(1, demandData.events_leads)
        : 0,
      color: 'bg-amber-500',
    },
    {
      name: 'Email Marketing',
      leads: demandData.email_leads,
      spend: debouncedAllocation.email,
      costPerLead: debouncedAllocation.email > 0
        ? (debouncedAllocation.email * 100000) / Math.max(1, demandData.email_leads)
        : 0,
      color: 'bg-teal-500',
    },
    {
      name: 'Direct Marketing',
      leads: demandData.direct_leads,
      spend: debouncedAllocation.directMarketing,
      costPerLead: debouncedAllocation.directMarketing > 0
        ? (debouncedAllocation.directMarketing * 100000) / Math.max(1, demandData.direct_leads)
        : 0,
      color: 'bg-rose-500',
    },
  ].filter(channel => channel.leads > 0 || channel.spend > 0);

  const maxLeads = Math.max(...channels.map(c => c.leads), 1);
  const conversionPct = parsePercentage(demandData.expected_conversion_pct);
  const ceilingPct = parsePercentage(demandData.conversion_ceiling_pct);
  const ceilingConstrained = conversionPct >= ceilingPct * 0.95;

  return (
    <div className={`bg-white rounded-lg border border-stone-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-stone-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-stone-700" />
            <h3 className="font-semibold text-stone-900">Demand Generation Breakdown</h3>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <div className="animate-spin h-3 w-3 border-2 border-stone-400 border-t-transparent rounded-full" />
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Channel breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-stone-700 mb-3">Lead Generation by Channel</h4>
          <div className="space-y-3">
            {channels.length === 0 ? (
              <p className="text-sm text-stone-500 italic">
                No marketing spend allocated. Adjust your investments to see lead generation.
              </p>
            ) : (
              channels.map((channel) => (
                <div key={channel.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-700">{channel.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-stone-900">
                        {formatBuyerCount(channel.leads)} leads
                      </span>
                      {channel.costPerLead > 0 && (
                        <span className="text-xs text-stone-500 font-mono">
                          ₹{Math.round(channel.costPerLead).toLocaleString('en-IN')}/lead
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-stone-100 rounded-full h-2">
                      <div
                        className={`${channel.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(channel.leads / maxLeads) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-500 font-mono w-12 text-right">
                      {((channel.leads / demandData.total_raw_leads) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
          <div>
            <p className="text-xs text-stone-600 mb-1">Total Raw Leads</p>
            <p className="text-2xl font-bold font-mono text-stone-900">
              {formatBuyerCount(demandData.total_raw_leads)}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-600 mb-1">After Brand Multiplier</p>
            <p className="text-2xl font-bold font-mono text-stone-900">
              {formatBuyerCount(demandData.effective_leads)}
            </p>
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="pt-4 border-t border-stone-200">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">Conversion Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Expected Conversion Rate</span>
              <span className="font-mono font-semibold text-stone-900">
                {demandData.expected_conversion_pct}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">Product Conversion Ceiling</span>
              <span className="font-mono font-semibold text-stone-900">
                {demandData.conversion_ceiling_pct}
              </span>
            </div>
            
            {ceilingConstrained && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold">Product ceiling is constraining conversion</p>
                  <p className="mt-1">
                    Invest in R&D (Quality, Innovation) or the Innovation Board to raise the ceiling.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Market position */}
        <div className="pt-4 border-t border-stone-200">
          <h4 className="text-sm font-semibold text-stone-700 mb-3">Competitive Position</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-600 mb-1">Your Strength</p>
              <p className="text-lg font-mono font-semibold text-emerald-700">
                {demandData.our_strength}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-600 mb-1">Rival Strength</p>
              <p className="text-lg font-mono font-semibold text-rose-700">
                {demandData.rival_strength}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>
              You can attract <strong className="text-stone-900">{demandData.attractive_share_pct}</strong> of 
              the {formatBuyerCount(demandData.total_market_demand)} unit market
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
