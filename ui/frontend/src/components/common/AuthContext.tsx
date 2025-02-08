"use client";

import { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export const AuthContext: FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      setSession(currentSession);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Wait until we have checked the session
    if (session === undefined) return;

    if (!session && pathname !== "/login") {
      router.push("/login");
    } else if (session && pathname === "/login") {
      router.push("/");
    }
  }, [session, pathname, router]);

  // Show nothing while we're checking the session
  if (session === undefined) {
    return null;
  }

  return <>{children}</>;
};

export default AuthContext;
