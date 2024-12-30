import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Communities } from "@/components/Communities";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Communities />
    </div>
  );
};

export default Index;