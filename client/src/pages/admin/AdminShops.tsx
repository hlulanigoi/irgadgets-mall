import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminShops() {
  const { data: shops, isLoading } = useQuery({
    queryKey: ["/api/admin/shops"],
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/shops/${shopId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shops"] });
      toast({
        title: "Success",
        description: "Shop status updated successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Shop Management</h1>
          <p className="text-muted-foreground">Manage and moderate shops</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops?.map((shop: any) => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={shop.imageUrl}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{shop.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {shop.category}
                    </Badge>
                  </div>
                  <Badge
                    variant={shop.status === "active" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {shop.status || "active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {shop.location}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {shop.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Owner ID: {shop.ownerId}
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/shops/${shop.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Shop
                    </Button>
                  </Link>
                  {shop.status === "active" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({ shopId: shop.id, status: "suspended" })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({ shopId: shop.id, status: "active" })
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
