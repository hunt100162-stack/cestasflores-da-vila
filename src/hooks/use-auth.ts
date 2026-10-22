import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.auth.getUser().then(({ data }) => { setUser(data.user ?? null); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  const roles = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  const list = roles.data ?? [];
  return {
    user,
    ready: ready && (!user || !roles.isLoading),
    isAdmin: list.includes("admin"),
    isStaff: list.includes("admin") || list.includes("staff"),
  };
}
