import { useShops } from "@/hooks/use-shops";
import { Navigation } from "@/components/Navigation";
import { ShopCard } from "@/components/ShopCard";
import { CreateShopModal } from "@/components/CreateShopModal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopsList() {
  const [filter, setFilter] = useState<"tailor" | "laundry" | "retail" | "service" | undefined>();
  const { data: shops, isLoading, error } = useShops(filter);

  const categories = [
    { id: undefined, label: "All Shops" },
    { id: "retail", label: "Retail" },
    { id: "tailor", label: "Tailors" },
    { id: "laundry", label: "Laundry" },
    { id: "service", label: "Services" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Find the best local businesses near you.</p>
          </div>
          
          <CreateShopModal />
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setFilter(cat.id as any)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${filter === cat.id 
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-medium">Failed to load shops. Please try again.</p>
          </div>
        ) : shops?.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              There aren't any shops in this category yet. Be the first to open one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops?.map((shop, idx) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ShopCard shop={shop} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
