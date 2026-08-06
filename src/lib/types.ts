export type FoodType = "wet" | "dry";
export type Unit = "grams" | "scoop" | "pouch";

export interface Household {
  id: string;
  key: string;
  cat_name: string;
  dry_scoop_g: number;
  wet_pouch_g: number;
  daily_target_g: number | null;
}

export interface FoodLog {
  id: string;
  household_id: string;
  fed_at: string;
  food_type: FoodType;
  amount: number;
  unit: Unit;
  fed_by: string | null;
  note: string | null;
}

export interface WeightLog {
  id: string;
  household_id: string;
  measured_on: string;
  weight_kg: number;
}
