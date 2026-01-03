import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { useFirebaseAuth } from "@/contexts/AuthContext";

async function fetchUser(token: string): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { currentUser, logout: firebaseLogout, loading: firebaseLoading, getIdToken } = useFirebaseAuth();

  const { data: user, isLoading: isDbLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user", currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return null;
      const token = await getIdToken();
      if (!token) return null;
      return fetchUser(token);
    },
    enabled: !!currentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await firebaseLogout();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    firebaseUser: currentUser,
    isLoading: firebaseLoading || isDbLoading,
    isAuthenticated: !!currentUser && !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    getIdToken,
  };
}
