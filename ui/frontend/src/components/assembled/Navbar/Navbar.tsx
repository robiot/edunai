import { ChevronDown, ListFilter, LogOut, WalletCards } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC, useState } from "react";

import { AllCardsModal } from "@/app/(app)/decks/[id]/_components/AllCardsModal";
import { CreateCardModal } from "@/app/(app)/decks/[id]/_components/CreateCardModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

export const Navbar: FC = () => {
  const router = useRouter();
  const parameters = useParams();
  const deckId = parameters?.id as string;
  const [userName, setUserName] = useState<string>("");

  // Get user data on component mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      // Use user's email if no name is available
      setUserName(
        session.user.user_metadata.full_name || session.user.email || "User",
      );
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="w-full sticky inset-0 border-b-border border-b h-16 bg-background">
      <div
        className="w-full flex h-full justify-between items-center px-4"

        // size="large"
      >
        <h1 className="text-2xl text-[#605BFB] font-extrabold">edunai</h1>

        <div className="flex items-center gap-2">
          {deckId && (
            <>
              <CreateCardModal onSuccess={() => window.location.reload()}>
                <Button variant="outline" size="sm" className="flex gap-2">
                  <WalletCards size={20} />
                  Add Card
                </Button>
              </CreateCardModal>

              <AllCardsModal deckId={deckId}>
                <Button variant="outline" size="sm" className="flex gap-2">
                  <ListFilter size={20} />
                  View Cards
                </Button>
              </AllCardsModal>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground/80 gap-4">
                <span>{userName}</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
