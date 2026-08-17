import VendorCard from "@/components/VendorCard";
import { mockVendors } from "@/lib/mockData";

// Day 2-4: builds against mockVendors. Day 5: swap to getVendors() from lib/api.ts.
export default function VendorListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vendors</h2>
        <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">
          + Add Vendor
        </button>
      </div>
      <div className="space-y-2">
        {mockVendors.map((v) => (
          <VendorCard key={v.vendor_id} vendor={v} />
        ))}
      </div>
    </div>
  );
}
