import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Communities } from "@/components/Communities";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          className="border-egalio-purple text-egalio-purple hover:bg-egalio-purple/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <Hero />
      <Features />
      <Communities />
    </div>
  );
};

export default Index;