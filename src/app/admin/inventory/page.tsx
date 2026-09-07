export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getInventory } from "./actions";
import { InventoryClient } from "./client";

export default async function AdminInventoryPage() {
  const items = await getInventory();
  
  return (
    <div className="w-full">
      <InventoryClient items={items} />
    </div>
  );
}
