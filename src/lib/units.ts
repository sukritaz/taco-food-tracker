import type { FoodLog, FoodType, Household, Unit } from "./types";

export const VALID_UNITS: Unit[] = ["grams", "scoop", "pouch"];
export const VALID_FOODS: FoodType[] = ["wet", "dry"];

// Which units make sense per food type (UI hint only; DB accepts any valid unit).
export const UNITS_FOR_FOOD: Record<FoodType, Unit[]> = {
  dry: ["scoop", "grams"],
  wet: ["pouch", "grams"],
};

// Convert a single entry to grams using the household's configured factors.
// Returns null when the unit can't be converted for that food (shouldn't happen
// with the UI, but keeps the grams view honest).
export function toGrams(log: Pick<FoodLog, "amount" | "unit" | "food_type">, h: Household): number | null {
  switch (log.unit) {
    case "grams":
      return log.amount;
    case "scoop":
      return log.food_type === "dry" ? log.amount * h.dry_scoop_g : null;
    case "pouch":
      return log.food_type === "wet" ? log.amount * h.wet_pouch_g : null;
    default:
      return null;
  }
}

export type ViewUnit = "raw" | "grams";

// Format an entry for display. "raw" keeps the logged unit ("1 scoop").
// "grams" converts via household factors ("30 g"); falls back to raw if it can't.
export function formatAmount(
  log: Pick<FoodLog, "amount" | "unit" | "food_type">,
  h: Household,
  view: ViewUnit,
): string {
  if (view === "grams") {
    const g = toGrams(log, h);
    if (g !== null) return `${round(g)} g`;
  }
  return `${round(log.amount)} ${unitLabel(log.unit, log.amount)}`;
}

export function unitLabel(unit: Unit, amount: number): string {
  const plural = amount === 1 ? "" : "s";
  if (unit === "grams") return "g";
  if (unit === "scoop") return `scoop${plural}`;
  return `pouch${amount === 1 ? "" : "es"}`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
