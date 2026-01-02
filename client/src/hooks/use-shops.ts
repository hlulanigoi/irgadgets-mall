import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateShopRequest, type CreateProductRequest } from "@shared/routes";

export function useShops(category?: "tailor" | "laundry" | "retail" | "service") {
  return useQuery({
    queryKey: [api.shops.list.path, category],
    queryFn: async () => {
      const url = category 
        ? `${api.shops.list.path}?category=${category}` 
        : api.shops.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch shops");
      return api.shops.list.responses[200].parse(await res.json());
    },
  });
}

export function useShop(id: number) {
  return useQuery({
    queryKey: [api.shops.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.shops.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch shop");
      return api.shops.get.responses[200].parse(await res.json());
    },
  });
}

export function useShopProducts(shopId: number) {
  return useQuery({
    queryKey: [api.products.listByShop.path, shopId],
    queryFn: async () => {
      const url = buildUrl(api.products.listByShop.path, { shopId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.listByShop.responses[200].parse(await res.json());
    },
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShopRequest) => {
      const res = await fetch(api.shops.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create shop");
      return api.shops.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shops.list.path] }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, ...data }: CreateProductRequest & { shopId: number }) => {
      const url = buildUrl(api.products.create.path, { shopId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => 
      queryClient.invalidateQueries({ queryKey: [api.products.listByShop.path, variables.shopId] }),
  });
}
