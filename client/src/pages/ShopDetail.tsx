import { useRoute } from "wouter";
import { useShop, useShopProducts, useCreateProduct } from "@/hooks/use-shops";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { insertProductSchema, type Order } from "@shared/schema";
import { z } from "zod";
import { Loader2, MapPin, Tag, ArrowLeft, Plus, Check, ShoppingCart, Truck, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

function ShopOwnerOrders({ shopId }: { shopId: number }) {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: [`/api/shops/${shopId}/orders`],
  });

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold font-display">Incoming Orders</h3>
      {orders?.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders?.map((order: Order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">Status: {order.status}</p>
                  </div>
                  <div className="text-sm">
                    {order.status === "pending" && "Preparing..."}
                    {order.status === "transport_requested" && "Waiting for transport..."}
                    {order.status === "picked_up" && "Out for delivery!"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopDetail() {
  const [match, params] = useRoute("/shops/:id");
  const shopId = params ? parseInt(params.id) : 0;
  
  const { data: shop, isLoading: shopLoading } = useShop(shopId);
  const { data: products, isLoading: productsLoading } = useShopProducts(shopId);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async ({ productId, transportRequested }: { productId: number, transportRequested: boolean }) => {
      const res = await apiRequest("POST", "/api/orders", {
        shopId,
        productId,
        status: transportRequested ? "transport_requested" : "pending"
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order has been sent. Community members can now see your transport request if selected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/pending-transport"] });
    },
  });

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
          <div className="lg:col-span-2 space-y-12">
            {isOwner && <ShopOwnerOrders shopId={shopId} />}

            <div className="space-y-8">
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
                    <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                      <div className="aspect-square relative overflow-hidden bg-gray-50">
                         <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span className="font-bold text-lg text-gray-900">{product.name}</span>
                          <span className="font-mono font-bold text-primary">R{product.price}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2">
                        <Button 
                          className="w-full rounded-full gap-2"
                          onClick={() => orderMutation.mutate({ productId: product.id, transportRequested: false })}
                          disabled={orderMutation.isPending || isOwner}
                        >
                          {orderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                          Standard Order
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
                          onClick={() => orderMutation.mutate({ productId: product.id, transportRequested: true })}
                          disabled={orderMutation.isPending || isOwner}
                        >
                          <Truck className="w-4 h-4" />
                          Order + Transport
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
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
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Open today until 5:00 PM</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Delivery available in local area</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-gray-900 text-white hover:bg-black">
                Contact Shop
              </Button>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Need help with transport?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary/80 mb-4">
                  Request a local community member to pick up and deliver your order.
                </p>
                <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10" onClick={() => window.location.href = '/tasks'}>
                  Find a Transporter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
