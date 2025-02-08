"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (!error) {
        router.push("/"); // or wherever you want to redirect after login
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
}
