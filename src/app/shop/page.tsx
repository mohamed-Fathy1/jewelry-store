import ProductGrid from "@/components/shop/ProductGrid";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light">All Jewelry</h1>
            <SortDropdown />
          </div>
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
