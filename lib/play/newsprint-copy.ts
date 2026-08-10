import type { Scenario } from "@/lib/play/types";

/** Every string below is built from the scenario's own fields -- no scenario-specific copy, so a
 *  second scenario reads correctly without touching this file. */

export function storyCopy(scenario: Scenario) {
  const byKey = Object.fromEntries(scenario.metrics.map((m) => [m.key, m.value]));
  const ledgerBits = [
    byKey.cash && `${byKey.cash} still in the bank`,
    byKey.customers && `${byKey.customers} customers who expect the product to keep working`,
    byKey.burn && `a burn rate of ${byKey.burn} a month`,
  ].filter((x): x is string => Boolean(x));
  const ledger =
    ledgerBits.length > 1
      ? `${ledgerBits.slice(0, -1).join(", ")}, and ${ledgerBits.at(-1)}`
      : (ledgerBits[0] ?? "a ledger the board has already seen");

  return {
    kicker: `${scenario.company.sector} · ${scenario.quarterLabel} dispatch`,
    headline: `${scenario.company.name} opens its books for ${scenario.quarterLabel}`,
    deck: `${scenario.company.name} is a ${scenario.company.stage}-stage ${scenario.company.sector} company, and its ${scenario.quarterLabel.toLowerCase()} ledger just landed on the incoming CEO's desk. The board is already watching.`,
    lead: `${scenario.company.name} built its name on ${scenario.company.sector}. Today the numbers come due: ${ledger}. What happens next is not a drill -- every rupee committed this quarter becomes part of the permanent record, read back at the next board meeting whether it worked or not.`,
  };
}

export function kpiCopy(scenario: Scenario) {
  return {
    kicker: `${scenario.quarterLabel} · market data`,
    headline: `${scenario.company.name}, by the numbers`,
    evaluation: `${scenario.company.name} is not thriving, and it is not failing. That is the honest read on a ${scenario.company.stage}-stage ${scenario.company.sector} company after one real quarter of trading: watched closely, spent carefully, one bad call away from a very different headline. The next set of numbers belongs to whoever sits down first.`,
  };
}
