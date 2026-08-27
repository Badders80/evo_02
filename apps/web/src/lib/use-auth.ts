"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

/**
 * Supabase auth adapter matching the evo_01 useAuth() shape.
 * user.displayName = email local-part (before @).
 */
export interface AuthUser {
  email: string;
  displayName: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const mapUser = (email: string | undefined): AuthUser | null => {
      if (!email) return null;
      const local = email.split("@")[0] || email;
      // "first.last@" or "first_last@" → "First Last"; else leave as-is
      const displayName = /[._-]/.test(local)
        ? local
            .split(/[_\-.]/)[0]
            .replace(/^\w/, (c) => c.toUpperCase())
        : local;
      return { email, displayName };
    };

    supabase.auth.getSession().then(({ data }) => {
      setUser(mapUser(data.session?.user?.email ?? undefined));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user?.email ?? undefined));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  };

  return { user, signOut, loading };
}