import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const Hero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      toast({
        title: "Welcome back!",
        description: "You're already logged in. Explore communities below!",
      });
    }
  };

  const handleLearnMore = () => {
    // Smooth scroll to Features section
    document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-egalio-purple/10 via-egalio-teal/10 to-egalio-coral/10">
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 items-center">
          <div className="flex flex-col justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-egalio-purple via-egalio-teal to-egalio-coral">
                Welcome to ANA
              </h1>
              <p className="max-w-[600px] text-zinc-500 md:text-xl dark:text-zinc-400 mx-auto">
                A decentralized digital space for human-AI collaboration, cooperation, and mutual aid
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2 mx-auto">
              <div className="flex space-x-2 justify-center">
                <Button
                  className="bg-gradient-to-r from-egalio-purple to-egalio-teal text-white hover:opacity-90 transition-opacity"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="border-egalio-purple text-egalio-purple hover:bg-egalio-purple/10"
                  onClick={handleLearnMore}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};