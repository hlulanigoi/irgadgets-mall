import { useRoute } from "wouter";
import { useShop, useShopProducts, useCreateProduct } from "@/hooks/use-shops";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, MapPin, Tag, ArrowLeft, Plus, Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const productSchema = insertProductSchema.omit({ shopId: true }).extend({
  name: z.string().min(3, "Name required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  imageUrl: z.string().url("Valid URL required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

function AddProductModal({ shopId }: { shopId: number }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateProduct();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      inStock: true,
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutate(
      { ...values, shopId },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Summer Dress" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Save Product"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ShopDetail() {
  const [match, params] = useRoute("/shops/:id");
  const shopId = params ? parseInt(params.id) : 0;
  
  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: products, isLoading: productsLoading } = useShopProducts(shopId);
  const { user } = useAuth();

  if (shopLoading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!shop) return <div>Shop not found</div>;

  const isOwner = user?.id === shop.ownerId;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />

      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full bg-gray-900">
        <img 
          src={shop.imageUrl} 
          alt={shop.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
          <Link href="/shops" className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to shops
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase text-white tracking-wide">
                  {shop.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{shop.name}</h1>
              <div className="flex items-center text-white/80">
                <MapPin className="w-4 h-4 mr-2" />
                {shop.location}
              </div>
            </div>
            
            {isOwner && <AddProductModal shopId={shop.id} />}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - Products */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold font-display text-gray-900 border-b pb-4">
              Products & Services
            </h2>
            
            {productsLoading ? (
              <Loader2 className="animate-spin mx-auto text-primary" />
            ) : products?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products?.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                       <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                        <span className="font-mono font-bold text-primary">R{product.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      <Button variant="outline" className="w-full text-sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - About */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold font-display text-gray-900 mb-4">About the Shop</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {shop.description}
              </p>
              
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Verified Business
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary mr-2" />
                  {shop.location}
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-gray-900 text-white hover:bg-black">
                Contact Shop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
