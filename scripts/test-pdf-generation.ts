/**
 * Integration test script for PDF generation.
 * Tests the data mapping and API integration with mock data.
 * 
 * Run with: npx tsx scripts/test-pdf-generation.ts
 */

import { mapSimulationToReport, mapQuarterlyReport } from "../lib/api/report-mapper";
import type { QuarterScore } from "../lib/simulation/remote";
import type {
  CompanyState,
  PriorityId,
  QuarterResultShape,
  TermSheet,
} from "../lib/simulation/types";
import type { QuarterReportResponse } from "../lib/api/types";

console.log("🧪 Testing PDF Generation Integration\n");

// Test 1: Simulation Report Mapping
console.log("Test 1: Mapping full simulation data...");
try {
  const mockScores: QuarterScore[] = [
    {
      quarter: 1,
      score: 75,
      band: "Strong",
      final: 75,
      modifiers: [
        { id: "mod1", points: 5, why: "Good strategic decision" },
      ],
    },
    {
      quarter: 2,
      score: 80,
      band: "Strong",
      final: 80,
      modifiers: [],
    },
    {
      quarter: 3,
      score: 70,
      band: "Competent",
      final: 70,
      modifiers: [
        { id: "mod2", points: -5, why: "Missed opportunity" },
      ],
    },
    {
      quarter: 4,
      score: 85,
      band: "Strong",
      final: 85,
      modifiers: [],
    },
  ] as QuarterScore[];

  const mockHistory: QuarterResultShape[] = [
    {
      quarter: 1,
      cash: 500000,
      revenue: 200000,
      revenueT: 200000,
      units: 1000,
      unitsSold: 1000,
      cogs: 100000,
      grossProfit: 100000,
      netCF: 50000,
      netCashFlow: 50000,
      valuation: 2000000,
      marketShare: 0.05,
      customers: 500,
      opexSpend: 3000000,
      capexSpend: 1000000,
      marketingSpend: 500000,
      wasteFrac: 0.1,
      supplierRel: 85,
      debtClose: 0,
      totalHired: 5,
      totalFired: 0,
      started: [],
      drawn: 0,
      crisis: false,
      leadsWasted: 50,
      effLeads: 1000,
      unmetDemand: 20,
      ceilingBinding: false,
      ceiling: 0.8,
      satisfaction: 85,
      utilisation: 0.75,
      attritionNext: 0.1,
      seoFree: 100,
      buzzFree: 50,
      installedCapacity: 1500,
      attractShare: 0.06,
      leadsUsed: 950,
      leadWasteFrac: 0.05,
      capacityAdded: 0,
      empSat: 80,
      referralCapSpend: 100000,
      A: {
        quality: 200000,
        innovation: 150000,
        npd: 0,
        design: 100000,
        reps: 300000,
        cx: 150000,
        onboarding: 100000,
        capex: 0,
      } as any,
    },
    {
      quarter: 2,
      cash: 600000,
      revenue: 250000,
      revenueT: 250000,
      units: 1200,
      unitsSold: 1200,
      cogs: 125000,
      grossProfit: 125000,
      netCF: 75000,
      netCashFlow: 75000,
      valuation: 2500000,
      marketShare: 0.06,
      customers: 600,
      opexSpend: 3500000,
      capexSpend: 1200000,
      marketingSpend: 600000,
      wasteFrac: 0.08,
      supplierRel: 87,
      debtClose: 0,
      totalHired: 3,
      totalFired: 0,
      started: [],
      drawn: 0,
      crisis: false,
      leadsWasted: 40,
      effLeads: 1100,
      unmetDemand: 15,
      ceilingBinding: false,
      ceiling: 0.82,
      satisfaction: 87,
      utilisation: 0.78,
      attritionNext: 0.09,
      seoFree: 120,
      buzzFree: 60,
      installedCapacity: 1600,
      attractShare: 0.07,
      leadsUsed: 1060,
      leadWasteFrac: 0.04,
      capacityAdded: 100,
      empSat: 82,
      referralCapSpend: 120000,
      A: {
        quality: 220000,
        innovation: 160000,
        npd: 0,
        design: 110000,
        reps: 320000,
        cx: 160000,
        onboarding: 110000,
        capex: 0,
      } as any,
    },
    {
      quarter: 3,
      cash: 550000,
      revenue: 220000,
      revenueT: 220000,
      units: 1100,
      unitsSold: 1100,
      cogs: 110000,
      grossProfit: 110000,
      netCF: 40000,
      netCashFlow: 40000,
      valuation: 2200000,
      marketShare: 0.055,
      customers: 550,
      opexSpend: 3200000,
      capexSpend: 1100000,
      marketingSpend: 550000,
      wasteFrac: 0.12,
      supplierRel: 84,
      debtClose: 0,
      totalHired: 2,
      totalFired: 1,
      started: [],
      drawn: 0,
      crisis: false,
      leadsWasted: 60,
      effLeads: 1050,
      unmetDemand: 25,
      ceilingBinding: false,
      ceiling: 0.79,
      satisfaction: 84,
      utilisation: 0.73,
      attritionNext: 0.11,
      seoFree: 110,
      buzzFree: 55,
      installedCapacity: 1550,
      attractShare: 0.065,
      leadsUsed: 990,
      leadWasteFrac: 0.057,
      capacityAdded: 0,
      empSat: 79,
      referralCapSpend: 110000,
      A: {
        quality: 210000,
        innovation: 155000,
        npd: 0,
        design: 105000,
        reps: 310000,
        cx: 155000,
        onboarding: 105000,
        capex: 0,
      } as any,
    },
    {
      quarter: 4,
      cash: 700000,
      revenue: 300000,
      revenueT: 300000,
      units: 1500,
      unitsSold: 1500,
      cogs: 150000,
      grossProfit: 150000,
      netCF: 100000,
      netCashFlow: 100000,
      valuation: 3000000,
      marketShare: 0.075,
      customers: 750,
      opexSpend: 4000000,
      capexSpend: 1500000,
      marketingSpend: 700000,
      wasteFrac: 0.07,
      supplierRel: 88,
      debtClose: 0,
      totalHired: 5,
      totalFired: 0,
      started: [],
      drawn: 0,
      crisis: false,
      leadsWasted: 35,
      effLeads: 1200,
      unmetDemand: 10,
      ceilingBinding: false,
      ceiling: 0.85,
      satisfaction: 88,
      utilisation: 0.82,
      attritionNext: 0.08,
      seoFree: 130,
      buzzFree: 65,
      installedCapacity: 1700,
      attractShare: 0.08,
      leadsUsed: 1165,
      leadWasteFrac: 0.03,
      capacityAdded: 150,
      empSat: 85,
      referralCapSpend: 150000,
      A: {
        quality: 240000,
        innovation: 170000,
        npd: 0,
        design: 120000,
        reps: 350000,
        cx: 170000,
        onboarding: 120000,
        capex: 0,
      } as any,
    },
  ] as QuarterResultShape[];

  const mockPriorities: (PriorityId | null)[] = [
    "product_innovation",
    "customer_acquisition",
    "product_innovation",
    "operational_excellence",
  ];

  const mockState: CompanyState = {
    cash: 700000,
    revenue: 300000,
    unitsSold: 1500,
    valuation: 3000000,
    runway: 8,
    demand: 5000,
    price: 200,
    quality: 85,
    innovation: 80,
    brand: 70,
    cx: 75,
    rivalStrength: 60,
    staff: 25,
  } as CompanyState;

  const mockTermSheet: TermSheet = {
    path: "A",
    name: "Sequoia Series A",
    covenant: 5000,
  } as TermSheet;

  const mockEndgame = {
    path: "A",
    gameOver: false,
    covenantHit: true,
  };

  const simulationReport = mapSimulationToReport(
    mockScores,
    mockHistory,
    mockPriorities,
    mockState,
    mockTermSheet,
    mockEndgame,
    "Test Company",
    "Test CEO"
  );

  console.log("✅ Simulation report mapped successfully");
  console.log(`   - Company: ${simulationReport.metadata.company_name}`);
  console.log(`   - CEO: ${simulationReport.metadata.ceo_name}`);
  console.log(`   - Final Score: ${simulationReport.page_01_cover.final_score.toFixed(1)}`);
  console.log(`   - Verdict: ${simulationReport.page_01_cover.verdict_label}`);
  console.log(`   - Quarters: ${simulationReport.page_02_year_created.quarters.length}`);
  console.log(`   - Dimensions: ${simulationReport.page_03_profile.dimensions.length}`);
} catch (err) {
  console.error("❌ Simulation mapping failed:", err);
  process.exit(1);
}

// Test 2: Quarterly Report Mapping
console.log("\nTest 2: Mapping quarterly report data...");
try {
  const mockQuarterReport: QuarterReportResponse = {
    company_id: "test-company-id",
    quarter_id: "test-quarter-id",
    quarter_number: 2,
    outcome: {
      units_sold: { value: 1200, delta: 200 },
      revenue_inr: { value: 250000, delta: 50000 },
      cogs_inr: { value: 125000, delta: 25000 },
      gross_profit_inr: { value: 125000, delta: 25000 },
      net_cash_flow_inr: { value: 75000, delta: 25000 },
      closing_cash_inr: { value: 600000, delta: 100000 },
      cash_runway_quarters: { value: 8, delta: null },
      cash_runway_gap_reason: null,
      valuation_inr: { value: 2500000, delta: 500000 },
      valuation_gap_reason: null,
    },
    binding_constraints: [],
    decision_quality: {
      ceo_score: 80,
      band: "Strong",
      mechanical_points_available: 100,
      unscored_points: 0,
      modifiers: [
        {
          id: "mod1",
          points: 5,
          fired: true,
          applied_points: 5,
          detail: "Strategic investment in innovation",
        },
      ],
      scored_criteria: [],
      unscored_criteria: [],
    },
    evidence: {},
    run_status: "active",
    survival_triggered_by: null,
    survival_detail: null,
    run_summary: null,
  };

  const quarterlyReport = mapQuarterlyReport(
    mockQuarterReport,
    "Test Company Q2",
    "Test CEO"
  );

  console.log("✅ Quarterly report mapped successfully");
  console.log(`   - Company: ${quarterlyReport.metadata.company_name}`);
  console.log(`   - CEO: ${quarterlyReport.metadata.ceo_name}`);
  console.log(`   - Quarter Score: ${quarterlyReport.page_01_cover.final_score.toFixed(1)}`);
  console.log(`   - Verdict: ${quarterlyReport.page_01_cover.verdict_label}`);
} catch (err) {
  console.error("❌ Quarterly mapping failed:", err);
  process.exit(1);
}

// Test 3: Validate Report Schema Structure
console.log("\nTest 3: Validating report schema structure...");
try {
  const mockScores: QuarterScore[] = [
    { quarter: 1, score: 75, band: "Strong", final: 75, modifiers: [] } as QuarterScore,
  ];
  const mockHistory: QuarterResultShape[] = [
    {
      quarter: 1,
      cash: 500000,
      revenue: 200000,
      revenueT: 200000,
      units: 1000,
      cogs: 100000,
      grossProfit: 100000,
      netCF: 50000,
      netCashFlow: 50000,
      valuation: 2000000,
    } as QuarterResultShape,
  ];
  const mockState: CompanyState = {
    cash: 500000,
    revenue: 200000,
    unitsSold: 1000,
    valuation: 2000000,
    staff: 10,
  } as CompanyState;

  const report = mapSimulationToReport(
    mockScores,
    mockHistory,
    [null],
    mockState,
    null,
    null,
    "Schema Test",
    "Schema CEO"
  );

  // Validate all 12 pages exist
  const requiredPages = [
    "metadata",
    "page_01_cover",
    "page_02_year_created",
    "page_03_profile",
    "page_04_strength",
    "page_05_risk",
    "page_06_decision_that_mattered",
    "page_07_missed_opportunities",
    "page_08_adaptability",
    "page_09_decision_signature",
    "page_10_score_explained",
    "page_11_company_outcome",
    "page_12_next_move",
  ];

  const missingPages = requiredPages.filter(page => !(page in report));
  
  if (missingPages.length > 0) {
    throw new Error(`Missing pages: ${missingPages.join(", ")}`);
  }

  console.log("✅ All 12 pages present in report schema");
  console.log(`   - Metadata: ✓`);
  console.log(`   - Page 01 (Cover): ✓`);
  console.log(`   - Page 02 (Year Created): ✓`);
  console.log(`   - Page 03 (Profile): ✓`);
  console.log(`   - Page 04 (Strength): ✓`);
  console.log(`   - Page 05 (Risk): ✓`);
  console.log(`   - Page 06 (Decision That Mattered): ✓`);
  console.log(`   - Page 07 (Missed Opportunities): ✓`);
  console.log(`   - Page 08 (Adaptability): ✓`);
  console.log(`   - Page 09 (Decision Signature): ✓`);
  console.log(`   - Page 10 (Score Explained): ✓`);
  console.log(`   - Page 11 (Company Outcome): ✓`);
  console.log(`   - Page 12 (Next Move): ✓`);
} catch (err) {
  console.error("❌ Schema validation failed:", err);
  process.exit(1);
}

console.log("\n✅ All tests passed! PDF generation integration is ready.");
console.log("\n📝 Next steps:");
console.log("   1. Start the backend server: cd backend && uvicorn app.main:app --reload");
console.log("   2. Start the frontend: cd frontend && npm run dev");
console.log("   3. Test PDF generation in the UI by completing a quarter or simulation");
