"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LoginPage = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-7">
      <h1 className="text-4xl text-[#605BFB] font-bold">Edunai</h1>

      <Card className="p-6 px-8 w-full max-w-[25rem]">
        <Button className="p-6 flex w-full">Sign in with Google</Button>
      </Card>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-foreground/80">
        Learn anything anywhere anytime with AI
      </div>
    </div>
  );
};

export default LoginPage;
