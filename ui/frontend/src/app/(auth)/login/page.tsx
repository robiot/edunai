"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-7">
      <h1 className="text-4xl text-[#605BFB] font-bold">Edunai</h1>

      <Card className="p-6 px-8 w-full max-w-[25rem]">
        <Button
          className="p-6 flex w-full"
          onClick={async () => {
            try {
              const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                  },
                },
              });

              if (error) throw error;

              console.log("Success", data);
            } catch (error) {
              console.error("Error signing in with Google:", error);
            }
          }}
        >
          <Image
            width={20}
            height={20}
            src="/google.svg"
            alt="Google"
            className="mr-4"
          />
          Sign in with Google
        </Button>
      </Card>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-foreground/80">
        Learn anything anywhere anytime with AI
      </div>
    </div>
  );
};

export default LoginPage;
