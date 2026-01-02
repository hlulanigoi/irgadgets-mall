import { Link } from "wouter";
import { type Shop } from "@shared/schema";
import { MapPin } from "lucide-react";

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shops/${shop.id}`}>
      <div className="group h-full bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          <img 
            src={shop.imageUrl} 
            alt={shop.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1000";
            }}
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm text-gray-800 border border-white/50">
            {shop.category}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-xl font-bold font-display text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
            {shop.description}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 mt-auto pt-4 border-t border-dashed border-gray-100">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" />
            <span className="truncate">{shop.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
