import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      transport_requested: "bg-blue-100 text-blue-700",
      picked_up: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-muted-foreground">View and track all platform orders</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({orders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders?.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.map((order: any) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.id}</p>
                        <div className="text-sm text-muted-foreground space-y-1 mt-2">
                          <p>Customer ID: {order.customerId}</p>
                          <p>Shop ID: {order.shopId}</p>
                          <p>Product ID: {order.productId}</p>
                          {order.transportId && <p>Transport ID: {order.transportId}</p>}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
