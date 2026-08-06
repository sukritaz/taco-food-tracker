import { getHousehold } from "@/lib/household";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = (await getHousehold(key))!;
  return <SettingsClient householdKey={key} household={h} />;
}
